'use strict';

/**
 * Module dependencies
 */
var path = require('path'),
  Contrat = require(path.resolve('./modules/contrats/server/models/contrats.server.model')),
  contratMsSql = require(path.resolve('./modules/core/server/utils/mssql/index.mssql.utils')),
  validator = require('validator'),
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller')),
  factureCTRL = require(path.resolve('./modules/factures/server/controllers/factures.server.controller')),
  lineInvoice = require(path.resolve('./modules/factures/server/controllers/lineinvoice.server.controller')),
  suppInvoice = require(path.resolve('./modules/factures/server/controllers/supplement.server.controller')),
  validationCTRL = require(path.resolve('./modules/factures/server/controllers/validation.comptable.server.controller')),
  mssql_database_config = require(path.resolve('./config/lib/mssql_database_config'));
var async = require('async');
var logger = require(path.resolve('./config/lib/logger'));
var transverseMethod = require(path.resolve('./modules/core/server/utils/transverse.method.utils'));
var periodicityValues = require(path.resolve('./config/periodicity.values'));
var dateUtil = require(path.resolve('./modules/core/server/utils/date.utils'));
var linesContratCtrl = require(path.resolve('./modules/contrats/server/controllers/lines.contrat.server.controller'));
var _ = require('lodash');
/**
 * Show the current contrat
 */
exports.read = function (req, res) {
  res.json(req.contrat);
};


/**
 * List of Contrats
 */
exports.list = function (req, res) {
  contratMsSql.find(req.contratSqlQuery, mssql_database_config.sqlQuery.contrat.mappingList, function(datas, err) {
    if (err) {
      return res.status(500).send({
        message: errorHandler.getErrorMessage(err)
      });
    }
    return res.json(datas);
  });
};

/**
 * Cette fonction permet de creer un model ContratLine pour le dynamic mapping
 * @param contrat
 * @returns {Object} resultat
 */
var templatingContrat = function(contrat) {
  var resultat = {
    'contDateModif': transverseMethod.dateFormattedOrNull(contrat.dateModify),
    'contCompCode': transverseMethod.returnItemOrDefault(contrat.companyCode, ''),
    'contEstCode': transverseMethod.returnItemOrDefault(contrat.contratHeader.establishment.codeEtablissement, ''),
    'contNameEst': transverseMethod.returnItemOrDefault(contrat.contratHeader.establishment.nomEtablissement, ''),
    'contHder': transverseMethod.returnItemOrDefault(contrat.contratHeader.establishment.enTeteDocument, ''),
    'contMarkCode': transverseMethod.returnItemOrDefault(contrat.contratHeader.establishment.modele.marque.codeMarque, ''),
    'contMarkDesc': transverseMethod.returnItemOrDefault(contrat.contratHeader.establishment.modele.marque.description, ''),
    'contModelCode': transverseMethod.returnItemOrDefault(contrat.contratHeader.establishment.modele.code, null),
    'contUserCode': transverseMethod.returnItemOrDefault(contrat.userCode, ''),
    'contCurrCode': transverseMethod.returnItemOrDefault(contrat.currencyCode, ''),
    'invCustCode': transverseMethod.returnItemOrDefault(contrat.contratHeader.client.codeClient, 0),
    'invCustAccnt': transverseMethod.returnItemOrDefault(contrat.contratHeader.client.activity.account, ''),
    'invUndCustAccnt': transverseMethod.returnItemOrDefault(contrat.contratHeader.client.activity.subAccount, ''),
    'invActvity': transverseMethod.returnItemOrDefault(contrat.contratHeader.client.activity.activity, 'DIV'),
    'invCustTaxCode': transverseMethod.returnItemOrDefault(contrat.contratHeader.client.numeroTvaIntraComUe, ''),
    'isCustPassing': transverseMethod.returnItemOrDefault(contrat.contratHeader.client.estClientDePassage, 0),
    'isCustCash': transverseMethod.returnItemOrDefault(contrat.contratHeader.client.estClientComptant, 0),
    'invCustLastName': transverseMethod.returnItemOrDefault(contrat.contratHeader.client.nomClient, ''),
    'invCustFirstName': transverseMethod.returnItemOrDefault(contrat.contratHeader.client.prenomClient, ''),
    'invCustTilte': transverseMethod.returnItemOrDefault(contrat.contratHeader.client.titre, ''),
    'invCustAddr': transverseMethod.returnItemOrDefault(contrat.contratHeader.client.adresse, ''),
    'invCustStreet': transverseMethod.returnItemOrDefault(contrat.contratHeader.client.voieAdresse, ''),
    'invCustAddrNumber': transverseMethod.returnItemOrDefault(contrat.contratHeader.client.numAdresse, ''),
    'invCustZip': transverseMethod.returnItemOrDefault(contrat.contratHeader.client.codePostal, ''),
    'invCustCity': transverseMethod.returnItemOrDefault(contrat.contratHeader.client.ville, ''),
    'invCustProvince': transverseMethod.returnItemOrDefault(contrat.contratHeader.client.departement, ''),
    'invCustCntry': transverseMethod.returnItemOrDefault(contrat.contratHeader.client.pays, ''),
    'invCustPhone': transverseMethod.returnItemOrDefault(contrat.contratHeader.client.tel1, ''),
    'invCustCell': transverseMethod.returnItemOrDefault(contrat.contratHeader.client.mobile, ''),
    'invCustFax': transverseMethod.returnItemOrDefault(contrat.contratHeader.client.telecopi, ''),
    'invCustPhone2': transverseMethod.returnItemOrDefault(contrat.contratHeader.client.domicile, ''),
    'invCustMail': transverseMethod.returnItemOrDefault(contrat.contratHeader.client.email, ''),
    'invCustCif': transverseMethod.returnItemOrDefault(contrat.contratHeader.client.siret, ''),
    'contState': transverseMethod.returnItemOrDefault(contrat.contratHeader.stateContrat, 0),
    'invTitleDesc': transverseMethod.returnItemOrDefault(contrat.contratHeader.client.civilite, ''),
    'invSupplement': transverseMethod.returnItemOrDefault(contrat.contratHeader.client.complement, ''),
    'invReference': transverseMethod.returnItemOrDefault(contrat.contratHeader.client.complementCommande.reference, ''),
    'invResponsible': transverseMethod.returnItemOrDefault(contrat.contratHeader.client.complementCommande.serviceEmetteur, ''),
    'invTranService': transverseMethod.returnItemOrDefault(contrat.contratHeader.client.complementCommande.serviceEmetteur, ''),
    'invNumClient': transverseMethod.returnItemOrDefault(contrat.contratHeader.client.complementCommande.numClient, ''),
    'invNumPhone': transverseMethod.returnItemOrDefault(contrat.contratHeader.client.complementCommande.numTelephone, ''),
    'invRegisNumber': transverseMethod.returnItemOrDefault(contrat.contratHeader.client.complementCommande.numImmatriculation, ''),
    'invAccountClient': transverseMethod.returnItemOrDefault(contrat.contratHeader.client.complementCommande.compteClient, ''),
    'invAttention': transverseMethod.returnItemOrDefault(contrat.contratHeader.client.complementCommande.attention, ''),
    'invRegularization': transverseMethod.returnItemOrDefault(contrat.contratHeader.client.complementCommande.regularisation, ''),
    'invPersonToContact': transverseMethod.returnItemOrDefault(contrat.contratHeader.client.complementCommande.personToContact, ''),
    'invCarModel': transverseMethod.returnItemOrDefault(contrat.contratHeader.client.complementCommande.vehiculeModel, ''),
    'contTypInv': transverseMethod.returnItemOrDefault(contrat.contratHeader.typeFacturation.code, null),
    'contCarCode': transverseMethod.returnItemOrDefault(contrat.contratParameters.vehicule && contrat.contratParameters.vehicule.code, ''),
    'contCarModel': transverseMethod.returnItemOrDefault(contrat.contratParameters.vehicule && contrat.contratParameters.vehicule.vehiculeModel, ''),
    'contCarDescription': transverseMethod.returnItemOrDefault(contrat.contratParameters.vehicule && contrat.contratParameters.vehicule.description, ''),
    'invCarChassis': transverseMethod.returnItemOrDefault(contrat.contratHeader.client.complementCommande.chassis, ''),
    'contCarImmatriculation': transverseMethod.returnItemOrDefault(contrat.contratHeader.client.complementCommande.numImmatriculation, ''),
    'invCarEsVO': transverseMethod.returnItemOrDefault(contrat.contratHeader.client.complementCommande.esVO, 0),
    'invCarEsCourtoisie': transverseMethod.returnItemOrDefault(contrat.contratHeader.client.complementCommande.esCourtoisie, 0),
    'invCarOwner': transverseMethod.returnItemOrDefault(contrat.contratHeader.client.complementCommande.carOwner, ''),
    'invCarMark': transverseMethod.returnItemOrDefault(contrat.contratHeader.client.complementCommande.carMark, ''),
    'contStartDate': transverseMethod.dateFormattedOrNull(contrat.contratParameters.startDate, null),
    'contEndDate': transverseMethod.dateFormattedOrNull(contrat.contratParameters.endDate, null),
    'contHtAmountGlobal': transverseMethod.truncateDecimalHundredth(transverseMethod.returnItemOrDefault(contrat.contratParameters.htAmountGlobal, 0.0)),
    'contTtcAmountGlobal': transverseMethod.truncateDecimalHundredth(transverseMethod.returnItemOrDefault(contrat.contratParameters.ttcAmountGlobal, 0.0)),
    'contTtcInvoiceEdited': transverseMethod.truncateDecimalHundredth(transverseMethod.returnItemOrDefault(contrat.contratParameters.ttcInvoiceEdited, 0.0)),
    'contStartDateForNextPeriod': transverseMethod.dateFormattedOrNull(contrat.contratParameters.startDateForNextPeriod),
    'contDeadLineNumber': transverseMethod.returnItemOrDefault(contrat.contratParameters.deadLineNumber, null),
    'contPeriodicity': transverseMethod.returnItemOrDefault(contrat.contratParameters.periodicity, null),
    'contDeadLine': transverseMethod.returnItemOrDefault(contrat.contratParameters.deadLine, null),
    'contPaymentMode': transverseMethod.returnItemOrDefault(contrat.contratParameters.paymentMode.code, null),
    'contratCode': transverseMethod.returnItemOrDefault(contrat.contratHeader.contratCode, ''),
    'contNumberInvoiceEdited': transverseMethod.returnItemOrDefault(contrat.contratParameters.numberInvoiceEdited, 0.0),
    'contRealNumberInvoiceEdited': transverseMethod.returnItemOrDefault(contrat.contratParameters.realNumberInvoiceEdited, 0)
  };
  return resultat;
};

/**
 * Create a Contrats
 */
exports.create = function (req, res, next) {
  var contrat = req.body;
  contrat.userCode = req.user ? req.user.username : 'Administrador';
  contrat.companyCode = (req.user.currentCompany ? req.user.currentCompany : req.user.defaultCompany);
  var valuesSetting = templatingContrat(contrat);
  contratMsSql.dynamicMapping(mssql_database_config.sqlQuery.contrat.createContrat, valuesSetting, function(newRequest) {
    contratMsSql.insertUpdate(newRequest, function(datas, affected, err) {
      if (err) {
        logger.info('err', err);
        return res.status(500).send({
          message: errorHandler.getErrorMessage(err)
        });
      }
      if (!datas || !datas.length) {
        return res.status(304).send({
          message: 'no lines were added'
        });
      }
      contrat.code = datas[0].contCode;
      req.contrat = contrat;
      if (!contrat.lignes) {
        return res.json(contrat);
      }
      next();
    });


  });
};
/**
 * delete Contrat
 * @param req
 * @param res
 */
exports.delete = function(req, res) {
  var requete = mssql_database_config.sqlQuery.contrat.deleteContrat + req.contratID;
  contratMsSql.insertUpdate(requete, function(datas, affected, err) {
    if (err) {
      return res.status(500).send({
        message: errorHandler.getErrorMessage(err)
      });
    }
    if (!affected) {
      return res.status(304).send({
        message: 'no delete contrat'
      });
    }
    return res.json({});
  });
};

/**
 * checkIfFactureContratExist
 * @description verify if contrat contains invoices
 * @param {Object} contrat
 * @param {Function} done
 * @return {Boolean}
 */
var checkIfFactureContratExist = function(contrat, done) {
  factureCTRL.getAllContratFacture(contrat.code, function(factures) {
    var resultat = factures.length > 0;
    done(resultat);
  });
};

/**
 * Cette permet d'encapsuler la procedure de mettre a jour un contrat
 * @param req
 * @param res
 * @param next
 */
var updateContratProcess = function(req, res, next) {
  var contrat = req.body;
  contrat.companyCode = (req.user.currentCompany ? req.user.currentCompany : req.user.defaultCompany);
  var valuesSetting2 = templatingContrat(contrat);
  contratMsSql.dynamicMapping(mssql_database_config.sqlQuery.contrat.updateContrat, valuesSetting2, function(newRequest) {
    contratMsSql.insertUpdate(newRequest + req.contratID, function(datas, affected, err) {
      if (err) {
        return res.status(500).send({
          message: errorHandler.getErrorMessage(err)
        });
      }
      if (!affected) {
        return res.status(304).send({
          message: 'no pact updated'
        });
      }
      req.contrat = contrat;
      req.lignes = contrat.lignes;
      next();
    });
  });
};

/**
 * Cette methode permet la liste des ligne id ou code
 * @param lignes
 * @param done
 * @returns {*}
 */
var getLineIds = function(lignes, done) {
  var ligneIds = _.map(lignes, 'code');
  return done(ligneIds);
};

/**
 * Cette methode permet d'avoir la clause de la suppression multiple delete from table where id in (resultat_de_cette_methode)
 * @param ids
 * @param done
 * @returns {*}
 */

var deleteClauses = function(ids, done) {
  var clauses = _.join(ids, ',');
  return done(clauses);
};

/**
 * Cette methode permet d'encapsuler la procedure de suppression de contrat
 * @param req
 * @param res
 */
var deleteContratProcess = function(req, res) {
  var requete = mssql_database_config.sqlQuery.contrat.deleteContrat + req.contratID;
  var contrat = req.contrat;
  contratMsSql.insertUpdate(requete, function(datas, affected, err) {
    if (err) {
      return res.status(500).send({
        message: errorHandler.getErrorMessage(err)
      });
    }
    if (!affected) {
      return res.status(304).send({
        message: 'no delete contrat'
      });
    }

    if (!contrat.lignes || contrat.lignes.length === 0) {
      return res.json({
        code: '200.4',
        message: 'contrat succesfully delete'
      });
    }
    getLineIds(contrat.lignes, function(ids) {
      deleteClauses(ids, function(clauses) {
        var requete = mssql_database_config.sqlQuery.contrat.deleteMultipleContratLine + '(' + clauses + ')';
        contratMsSql.insertUpdate(requete, function(datas, affected, err) {
          if (err) {
            return res.status(500).send({
              message: errorHandler.getErrorMessage(err)
            });
          }
          return res.json({
            code: '200.4',
            message: 'contrat succesfully delete'
          });
        });
      });

    });
  });
};


/**
 * update
 * @description Update a contrat
 * @param {Object} req
 * @param {Object} res
 * @param {Function} next
 * @return {*}
 */
exports.update = function(req, res, next) {
  var contrat = req.body;
  contrat.userCode = req.user ? req.user.username : 'Administrador';
  checkIfFactureContratExist(contrat, function (resultat) {
    if (!resultat && contrat.contratHeader.stateContrat === 1) {
      deleteContratProcess(req, res);
    } else {
      updateContratProcess(req, res, next);
    }
  });

};


/**
 * periodicityValuesList return periodicity values
 * @param {Object} req
 * @param {Object} res
 */
exports.periodicityValuesList = function (req, res) {
  return res.json(periodicityValues);
};

/**
 * contratByID
 * @description Contrat middleware
 * @param {Object} req
 * @param {Object} res
 * @param {Function} next
 * @param {Number} id
 * @param {*}
 */
exports.contratByID = function (req, res, next, id) {
  if (!validator.isNumeric(id)) {
    return res.status(400).send({
      message: 'Contrat ID is invalid'
    });
  }
  req.contratID = id;
  contratMsSql.find(mssql_database_config.sqlQuery.contrat.getContrat + id, undefined, function(datas, err) {
    if (err) {
      return next(err);
    } else if (!datas || !datas.length) {
      return res.status(404).send({
        message: 'No pact with that identifier has been found'
      });
    }
    factureCTRL.getAllContratFacture(req.contratID, function(factures) {
      transverseMethod.reorganizationDataContrat(datas, 'contrat', factures, function(result) {
        req.contrat = result;
        next();

      });
    });

  });
};


/**
 * calculTotalHT
 * @description Calcul HT total
 * @param {Array} factures
 * @param {Function} done
 * @param {Number} totalHT
 */
function calculTotalHT (factures, done) {
  var totalHT = 0;
  async.each(factures,
    function (facture, callback) {
      if (facture.type && facture.type.name === 'Facture') {
        totalHT += facture.invoiceHT;
      } else if (facture.type && facture.type.name === 'Avoir') {
        totalHT -= facture.invoiceHT;
      }
      callback();
    },
    function () {
      done(totalHT);
    });
}

/**
 * calculValues
 * @description calculs Date de fin du contrat, nbre de factures éditées
 * @param {Object} req
 * @param {Object} res
 * @param {Function} next
 */
exports.calculValues = function(req, res, next) {
  var contrat = req.body,
    endDate = '',
    numberInvoiceEdited = 0,
    startDateForNextPeriod = '';

  // Si les parametres du contrat ou le nombre d'echeances  ne sont pas renseignés on calcule pas
  if (!contrat.contratParameters || !contrat.contratParameters.deadLineNumber) {
    return next();
  }

  // Date de fin du contrat : Date de début + Périodicité * Nombre d’échéances
  var tabPeriods = _.filter(periodicityValues, { code: parseInt(contrat.contratParameters.periodicity, 10) });
  var period = (tabPeriods && tabPeriods.length) ? tabPeriods[0] : { 'value': 30 };
  var days = period.value * parseInt(contrat.contratParameters.deadLineNumber, 10);
  endDate = dateUtil.calculDate(contrat.contratParameters.startDate, days, null, null);

  // Date de la prochaine échéance: Date de début + (Périodicité * Nombre de factures éditées + 1)
  startDateForNextPeriod = dateUtil.calculDate(contrat.contratParameters.startDate, (period.value * numberInvoiceEdited + period.value), null, null);

  // Calcul montant TTC du contrat (egale au TTC de la ligne * nbre e'echeances prévues)
  if (contrat.lignes && contrat.lignes.length) {
    var resultTTC = linesContratCtrl.calculValues(contrat.lignes[0]);
    contrat.contratParameters.ttcAmountGlobal = transverseMethod.truncateDecimalHundredth(resultTTC.totalTTC) * parseInt(contrat.contratParameters.deadLineNumber, 10);
  }

  // set all values
  contrat.contratParameters.endDate = endDate;
  contrat.contratParameters.startDateForNextPeriod = startDateForNextPeriod;

  req.body = contrat;
  next();
};

/**
 * createInvoiceObjectFromContrat
 * @description create an  Invoice's Object From Contrat
 * @param {Object} contrat
 * @return {Object} invoice
 */
var createInvoiceObjectFromContrat = function(contrat) {
  var invoice = {
    'contratCode': contrat.code,
    'invoiceDate': dateUtil.convertDateToString(new Date()),
    'invoiceDateModify': dateUtil.convertDateToString(new Date()),
    'etablissement': {
      'codeEtablissement': contrat.contratHeader.establishment.codeEtablissement,
      'enTeteDocument': contrat.contratHeader.establishment.enTeteDocument,
      'nomEtablissement': contrat.contratHeader.establishment.nomEtablissement,
      'modele': {
        'code': contrat.contratHeader.establishment.modele.code,
        'template': contrat.contratHeader.establishment.modele.template,
        'marque': {
          'codeMarque': contrat.contratHeader.establishment.modele.marque.codeMarque,
          'description': contrat.contratHeader.establishment.modele.marque.description
        }
      }
    },
    'companyCode': contrat.companyCode,
    'markCode': contrat.contratHeader.establishment.modele.marque.codeMarque,
    'userCode': contrat.userCode,
    'currencyCode': contrat.currencyCode,
    'type': {
      'typeInvoice': 1,
      'name': 'Facture'
    },
    'stateInvoice': 0,
    'categoryInvoice': 0,
    'client': contrat.contratHeader.client,
    'supplement': {
      'modePaiement': contrat.contratParameters.paymentMode.code,
      'THT': (contrat.lignes && contrat.lignes.length) ? contrat.lignes[0].totalHT : 0,
      'TTC': (contrat.lignes && contrat.lignes.length) ? contrat.lignes[0].totalTTC : 0,
      'TVA': (contrat.lignes && contrat.lignes.length && contrat.lignes[0].tva) ? contrat.lignes[0].tva.mntTva : 0,
      'remiseGlobal': {
        'compteCompta': '',
        'ttc': 0,
        'taux': 0,
        'compteAnalytic': '',
        'tht': 0
      },
      'zoneLibre1': '',
      'zoneLibre2': '',
      'zoneLibre3': '',
      'zoneLibre4': '',
      'zoneReserve1': '',
      'zoneReserve2': ''
    },
    'typeFacturation': contrat.contratHeader.typeFacturation,
    'lignes': contrat.lignes
  };
  return invoice;
};

/**
 * setPreformattedData
 * @description set preformatted data to label or comment attribute
 * @param {Object} invoice
 */
function setPreformattedData(req, res, invoice, next) {
  if (!invoice.contratCode || !invoice.lignes || !invoice.lignes.length || !invoice.lignes[0].preformattedData) {
    var message = { titre: res.__('saveContrat'), libelle: res.__('validelineError') };
    return res.status(500).send({
      code: '500.8',
      message: message
    });
  }
  if (invoice.lignes[0].linkPreformattedLibelle) {
    invoice.lignes[0].libelle = invoice.lignes[0].libelle + ' ' + invoice.lignes[0].preformattedData;
  }
  if (invoice.lignes[0].linkPreformattedComment) {
    invoice.lignes[0].commentaire = invoice.lignes[0].commentaire + ' ' + invoice.lignes[0].preformattedData;
  }
  return next(invoice);
}

/**
 * setModeReglementAndDeadLine
 * @description set Mode Reglement And deadLine
 * @param {Object} contrat
 * @param {Object} invoice
 */
function setModeReglementAndDeadLine(contrat, invoice) {
  invoice.client.activity.paymentMode = contrat.contratParameters.paymentMode;
  invoice.client.activity.paymentDeadline = { 'code': contrat.contratParameters.deadLine };
}

/**
 * createInvoiceFromContrat
 * @description create an Invoice From Contrat
 * @param {Object} req
 * @param {Object} res
 */
exports.createInvoiceFromContrat = function(req, res) {
  var invoice = createInvoiceObjectFromContrat(req.body);
  setPreformattedData(req, res, invoice, function(invc) {
    setModeReglementAndDeadLine(req.body, invc);
    req.body = invc;
    factureCTRL.create(req, res, function() {
      lineInvoice.create(req, res, function() {
        suppInvoice.create(req, res);
      });
    });
  });

};

