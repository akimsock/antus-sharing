'use strict';

var async = require('async');
var path = require('path'),
  ventilationCtrl = require(path.resolve('./modules/administrator/server/controllers/ventilation.server.controller')),
  typeInvoiceCtrl = require(path.resolve('./modules/administrator/server/controllers/type.invoice.server.controller')),
  accountCtrl = require(path.resolve('./modules/clients/server/controllers/account.server.controller')),
  Ventilation = require(path.resolve('./modules/administrator/server/models/ventilation.server.model'));
var logger = require(path.resolve('./config/lib/logger'));

function regexCodeLine(mask) {
  var re = /^[0-9]*$/;
  return re.test(mask);
}

/**
 * ifValid
 * @param {Object} field
 * @param {String} message
 * @param {Object} res
 */
var ifValid = function (field, message, res) {
  return (!field) ? res.__(message) : '';
};

/**
 * validateRequiredFieldsOnContratParameters
 * @description validate required field on contrat contratParameters
 * @param {Object} req
 * @param {Object} res
 * @param {Function} done
 * @return {*}
 */
exports.validateRequiredFieldsOnContratParameters = function (req, res, next) {
  var contrat = req.body,
    message = '',
    titre = res.__('saveContrat'),
    resultat = '';

  if (!contrat.contratParameters) {
    message = res.__('contratParameterRequired');
    return res.status(412).send({ code: '412.1', message: message, contrat: contrat });
  }
  if (contrat.lignes.length > 0 && !contrat.lignes[0].preformattedData) {
    message = res.__('preformatedData');
    return res.status(412).send({ code: '412.1', message: { titre: titre, libelle: message }, contrat: contrat });
  }
  resultat += ifValid(contrat.contratParameters.startDate, 'startDateRequired', res);
  resultat += ifValid(contrat.contratParameters.deadLineNumber, 'deadLineNumberRequired', res);
  resultat += ifValid(contrat.contratParameters.periodicity, 'periodicityRequired', res);
  resultat += ifValid(contrat.contratParameters.paymentMode, 'paymentModeRequired', res);
  resultat += ifValid(contrat.contratParameters.deadLineNumber > contrat.contratParameters.realNumberInvoiceEdited, 'nombreEcheanceValid', res);
  if (resultat !== '') {
    message = { titre: titre, libelle: resultat };
    return res.status(412).send({ code: '412.1', message: message, contrat: contrat });
  }
  next();
};

/**
 * validateRequiredFieldsOnContratHeader
 * @description validate required field on contrat header
 * @param {Object} req
 * @param {Object} res
 * @param {Function} done
 * @return {*}
 */
exports.validateRequiredFieldsOnContratHeader = function (req, res, next) {
  var contrat = req.body,
    titre = res.__('saveContrat'),
    message = '';
  // customer
  if (!contrat.contratHeader.client || !contrat.contratHeader.client.codeClient) {
    message = { titre: titre, libelle: res.__('clientRequired') };
    return res.status(412).send({ code: '412.2', message: message, contrat: contrat });
  }
  // Activity
  if (!contrat.contratHeader.client.activity || !contrat.contratHeader.client.activity.activity) {
    message = { titre: titre, libelle: res.__('activityRequired') };
    return res.status(412).send({ code: '412.2', message: message, contrat: contrat });
  }
  next();
};

/**
 * getCustomerDiversAccount
 * @description test si client a des comptes dans l'activité diverse
 * @param {Object} req
 * @param {Object} res
 * @param {Function} next
 */
exports.getCustomerDiversAccount = function (req, res, next) {
  var contrat = req.body,
    titre = res.__('saveContrat'),
    message = '';
  req.customerCode = '' + contrat.contratHeader.client.codeClient;
  accountCtrl.listCustomerAccounts(req, res, function(accounts) {
    if (!accounts || !accounts.div || !accounts.div.length || !accounts.div[0].account) {
      message = { titre: titre, libelle: res.__('accountDiversRequired') };
      return res.status(412).send({ code: '412.3', message: message, contrat: contrat });
    }
    next();
  });
};

/**
 * Cette methode permet de creer un objet message pour la validation
 * @param {Object} contrat
 * @param {String} titre
 * @param {String} message
 * @return {Object} contrat.message
 */
var setMessageError = function (contrat, titre, message) {
  var resultat = { titre: titre, libelle: message };
  contrat.message = resultat;
};

/**
 * Cette methode permet de concatener les messages d'erreur d'une ligne
 * @param {Array} errorTab
 * @param {Integer} pos
 * @param {Object} res
 */
var setMessageLineError = function (errorTab, pos, res) {
  var resultat = '';
  if (errorTab && errorTab[0] && !errorTab[0].state) {
    resultat = resultat + res.__('comptableAccountNotValidContrat', errorTab[0].value, pos.toString());
  }
  if (errorTab && errorTab[1] && !errorTab[1].state) {
    resultat = resultat + res.__('analyticAccountNotValidContrat', errorTab[1].value, pos.toString());
  }
  return resultat;
};


/**
 * Set All Messsage Error
 * @param {Object}   contrat
 * @param {Object}   res
 * @param {Function} done
 */
var setAllMessageError = function (contrat, res, done) {
  var allmess = '';
  var pos = 1;
  async.each(contrat.lignes,
    function (line, callback) {
      allmess = allmess + setMessageLineError(line.errors, pos, res);
      pos++;
      callback();
    },
    function () {
      done(allmess);
    });
};

/**
 * isMatch
 * @description test if codeLine match
 * @param {String} mask
 * @param {String} codeLine
 * @return {Boolean}
 */
function isMatch(mask, codeLine) {
  var tmp;
  mask = mask.trim();
  // test if mask contains *
  if (mask.indexOf('*') > -1) {
    tmp = mask.slice(0, mask.indexOf('*'));
    return codeLine.toString().startsWith(tmp);
  }
  if (mask.indexOf('?') > -1) {
    tmp = mask.slice(0, mask.indexOf('?'));
    return (isNaN(codeLine) === false && codeLine.length === mask.length && codeLine.startsWith(tmp));
  }
  return codeLine === mask;
}

/**
 * checkCodeMatchMask
 * @description Test if codeLine match mask
 * @param {String} codeLine
 * @param {String} mask
 * @param {Boolean} isRequired
 * @return {Boolean}
 */
function checkCodeMatchMask(codeLine, mask, isRequired) {
  // field is not required return true
  if (((isRequired === false || isRequired === 0 || !isRequired) && !codeLine) || mask === '*') {
    return true;
  }

  if (codeLine) {
    codeLine = codeLine.toString().trim();
  }

  // if mask is not define or test if codeLine contains only numbers
  if (!mask || !regexCodeLine(codeLine)) {
    return false;
  }

  return isMatch(mask, codeLine);
}

/**
 * Test if invoiceLine is valid
 */
function checkValidLine(invoiceLine, maskLine, isRequired) {

  invoiceLine.errors = [];
  invoiceLine.errors[0] = {
    state: checkCodeMatchMask(invoiceLine.codeComptable, maskLine.comptableMask, true) ? 1 : 0,
    value: invoiceLine.codeComptable
  };
  invoiceLine.errors[1] = {
    state: checkCodeMatchMask(invoiceLine.codeAnaltic, maskLine.analyticalMask, isRequired) ? 1 : 0,
    value: invoiceLine.codeAnaltic
  };
  var result = invoiceLine.errors[0].state && invoiceLine.errors[1].state;
  return result;
}

/**
 * Test if invoiceLine match at least one elt tabMask
 */
function checkLineInTabMask(line, tabMask, isRequired, done) {
  line.valid = false;
  async.each(tabMask,
    function (mask, callback) {
      if (checkValidLine(line, mask, isRequired)) {
        line.valid = true;
        // for quit the async.each
        callback(line.valid, null);
      } else {
        callback();
      }
    },
    function () {
      done(line.valid);
    });
}

/**
 * Test If type invoice have all discount account filled right
 * @param  {typeInvoice} typeInvoice
 * @return {Number} typeInvoice.discountAccount discountAccount
 */
var validateTypeInvoice = function (typeInvoice) {
  return (typeInvoice.discountAccount);
};

/**
 * Test if each line is valid
 */
function checkInvoiceLines(tabInvoiceLines, tabMask, isRequired, done) {
  var etatcontrat = true;
  async.each(tabInvoiceLines,
    function (line, callback) {
      checkLineInTabMask(line, tabMask, isRequired, function (valid) {
        etatcontrat = valid && etatcontrat;
        callback();
      });
    },
    function () {
      done(etatcontrat);
    });
}

/**
 * validate Ventilation
 */
function validVentilation(ventilation) {
  return (ventilation.comptableMask);
}


/**
 * validateTypeFacturationContrat
 * @description  verifu if type facturation contrat is correcte
 * @param {Object} req
 * @param {Object} res
 * @param {Function} next
 * @returns {*}
 */
exports.validateTypeFacturationContrat = function (req, res, next) {
  if (req.body.contratHeader && req.body.contratHeader.typeFacturation && req.body.contratHeader.typeFacturation.code) {
    // search type invoice by code
    typeInvoiceCtrl.searchTypeInvoiceById(req.body.contratHeader.typeFacturation.code, function (datasType, err) {
      if (err || (datasType && datasType.length === 0)) {
        var loggerMessage = err || 'This type fo facturation not founded in data source';
        return res.status(500).send({
          code: '500.5',
          title: 'Type Faturation is invalid',
          message: loggerMessage,
          contrat: req.body
        });
      } else {
        req.datasType = datasType;
        return next();
      }
    });
  } else {
    return res.status(500).send({
      code: '500.5',
      title: 'Type Faturation is invalid',
      contrat: req.body
    });
  }
};

/**
 * ifVentilationsIsPresent
 * @description  test si ce type de facturation dispose de ventilations
 * @param {Object} req
 * @param {Object} res
 * @param {Function} next
 * @returns {*}
 */
exports.ifVentilationsIsPresent = function (req, res, next) {
  var typeFacturation = req.datasType[0];
  var contrat = req.body;
  ventilationCtrl.findVentilationByInvoiceType(typeFacturation.code, function (datas, err) {

    if (err) {
      return next(err);
    }
    var ventilations = [];
    async.each(datas,
      function(item, callback) {
        var ventilation = new Ventilation(item).getData();
        ventilations.push(ventilation);
        callback();
      },
      function() {
        var firstVentilationTab = [];
        // recuperer la 1ere ligne de la ventilation
        if (ventilations.length > 0) {
          firstVentilationTab.push(ventilations[0]);
        }
        var ventilationArray = firstVentilationTab.filter(validVentilation);

        if (ventilationArray.length === 0) {
          var titre = res.__('saveContrat');
          var message = res.__('ventilationNotFound');
          setMessageError(contrat, titre, message);
          return res.status(500).send({
            code: '500.3',
            contrat: contrat
          });
        }
        req.ventilationTab = ventilationArray;
        next();
      }
    );

  });

};

  /**
   * validate Invoice
   */
exports.validateContrat = function (req, res, next) {
  var contrat = req.body;
  var ventilationArray = req.ventilationTab;
  checkInvoiceLines(contrat.lignes, ventilationArray, req.datasType[0].isRequired, function (etatcontrat) {
    if (etatcontrat) {
      next();
    } else {
      var message = {};
      setAllMessageError(contrat, res, function (allmess) {
        message = { titre: res.__('saveContrat'), libelle: allmess };
      });
      return res.status(500).send({
        code: '500.4',
        message: message,
        contrat: contrat
      });
    }
  });
};
