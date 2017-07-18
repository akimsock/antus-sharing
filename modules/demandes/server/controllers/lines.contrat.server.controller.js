'use strict';

/**
 * Module dependencies
 */
var path = require('path'),
  Line = require(path.resolve('./modules/factures/server/models/line.server.model')),
  lineMsSql = require(path.resolve('./modules/core/server/utils/mssql/index.mssql.utils')),
  contratMsSql = require(path.resolve('./modules/core/server/utils/mssql/index.mssql.utils')),
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller')),
  mssql_database_config = require(path.resolve('./config/lib/mssql_database_config')),
  validator = require('validator');
var async = require('async');
var _ = require('lodash');
var logger = require(path.resolve('./config/lib/logger'));
var transverseMethod = require(path.resolve('./modules/core/server/utils/transverse.method.utils'));

/**
 * calculValues
 * @param {Object} line
 * @return {Object}
 */
var calculValues = function(item) {
  var otherData = {};
  // Calcul du total HT pour une ligne
  otherData.totalHT = item.prixUnit * item.quantite;

  // Calcul du montant TVA de la ligne
  otherData.mntTva = otherData.totalHT * (((item.tva && item.tva.taux) || 0) / 100);

  // Calcul du montant TTC de la ligne
  otherData.totalTTC = otherData.totalHT + otherData.mntTva;

  return otherData;
};


/**
 * calculValues
 * @param {Object} req
 * @param {Object} res
 */
exports.calculTotauxLine = function(req, res, next) {
  var contrat = req.contrat;
  if (!contrat || !contrat.lignes || !contrat.lignes.length) {
    return next();
  }
  var item = contrat.lignes[0];
  var otherData = calculValues(item);
  // Comme il ya pas de remise prixNet de la ligne egale totalHT de la ligne
  contrat.lignes[0].totalHT = otherData.totalHT;
  contrat.lignes[0].prixNet = otherData.prixNet;
  contrat.lignes[0].mntTva = otherData.mntTva;
  contrat.lignes[0].totalTTC = otherData.totalTTC;
  req.contrat = contrat;
  next();
};

/**
 * templatingContratLine
 * @description Cette fonction permet de creer un model Contrat pour le dynamic mapping
 * @param contrat
 * @return {Object} resultat
 */
var templatingContratLine = function(contratLine) {
  var resultat = {
    'lnCode': transverseMethod.returnItemOrDefault(contratLine.code, contratLine.idContrat),
    'lnContCode': transverseMethod.returnItemOrDefault(contratLine.idContrat, 0),
    'lnAccC': transverseMethod.returnItemOrDefault(contratLine.codeComptable, ''),
    'lnContPos': transverseMethod.returnItemOrDefault(contratLine.position, 0),
    'lnAccA': transverseMethod.returnItemOrDefault(contratLine.codeAnaltic, ''),
    'lnTypeAcc': transverseMethod.returnItemOrDefault(contratLine.typeCompte, 'CC'),
    'lnLib': transverseMethod.returnItemOrDefault(contratLine.libelle, ''),
    'lnComment': transverseMethod.returnItemOrDefault(contratLine.commentaire, ''),
    'lnUP': transverseMethod.returnItemOrDefault(contratLine.prixUnit, 0),
    'contCurrCode': transverseMethod.returnItemOrDefault(contratLine.currencyCode, null),
    'lnQte': transverseMethod.returnItemOrDefault(contratLine.quantite, 0),
    'lnRateDisct': transverseMethod.returnItemOrDefault(contratLine.tauxRemise, 0),
    'lnUPnet': transverseMethod.truncateDecimalHundredth(transverseMethod.returnItemOrDefault(contratLine.totalHT, 0)),
    'lnTypeDisct': transverseMethod.returnItemOrDefault(contratLine.typeCompeRm, 'CC'),
    'lnAccCDisct': transverseMethod.returnItemOrDefault(contratLine.codeComptRm, ''),
    'lnAccADisct': transverseMethod.returnItemOrDefault(contratLine.codeAnalRm, ''),
    'lnMntDisct': transverseMethod.returnItemOrDefault(contratLine.mntRm, 0),
    'lnMntHT': transverseMethod.truncateDecimalHundredth(transverseMethod.returnItemOrDefault(contratLine.totalHT, 0)),
    'lnMntTTC': transverseMethod.truncateDecimalHundredth(transverseMethod.returnItemOrDefault(contratLine.totalTTC, 0)),
    'lnPreformattedData': transverseMethod.returnItemOrDefault(contratLine.preformattedData, ''),
    'lnlinkPreformattedLibelle': contratLine.linkPreformattedLibelle ? 1 : 0,
    'lnlinkPreformattedComment': contratLine.linkPreformattedComment ? 1 : 0,
    'lnTaxCode': transverseMethod.returnItemOrDefault(contratLine.tva.codeTVA, ''),
    'lnTaxeRate': transverseMethod.returnItemOrDefault(contratLine.tva.taux, 0),
    'lnMnttax': transverseMethod.truncateDecimalHundredth(transverseMethod.returnItemOrDefault(contratLine.tva.mntTva, 0)),
    'lnTaxAccCDisct': transverseMethod.returnItemOrDefault(contratLine.tva.compte, ''),
    'lnTaxAccADisct': transverseMethod.returnItemOrDefault(contratLine.tva.sousCompte, '')
  };
  return resultat;
};

var getLineIds = function(lignes, done) {
  var ligneIds = _.map(lignes, 'code');
  return done(ligneIds);
};

var deleteClauses = function(ids, done) {
  var clauses = _.join(ids, ',');
  return done(clauses);
};

exports.deleteMultipleContratLine = function(req, res, next) {
  var contrat = req.contrat;
  if (!contrat.lignes || contrat.lignes.length === 0) {
    next();
    return;
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
        next();
      });
    });

  });

};

/**
 * createInsertLineSql
 * @param {Object} contrat
 * @param {Function} done
 * @return {*}
 */
var createInsertLineSql = function(contrat, done) {
  var queryResult = '';
  var queryDelete = mssql_database_config.sqlQuery.contrat.deleteContratLine + contrat.code + ' and lnCode not in (';
  var queryInsert = mssql_database_config.sqlQuery.contrat.createContratLine;
  var queryUpdate = mssql_database_config.sqlQuery.contrat.updateContratLine;
  var i = 1;
  async.each(contrat.lignes,
    function (ligne, callback) {
      ligne.code = ligne.idContrat;
      if (!ligne.code) {
        ligne.position = 1;
        ligne.idContrat = contrat.code;
        var valuesSetting1 = templatingContratLine(ligne);
        contratMsSql.dynamicMapping(queryInsert, valuesSetting1, function(newRequest) {
          queryResult = queryResult + newRequest;
          i++;
          callback();
        });
      } else {
        ligne.idContrat = contrat.code;
        queryDelete = queryDelete + ligne.code + ',';
        var valuesSetting2 = templatingContratLine(ligne);
        contratMsSql.dynamicMapping(queryUpdate, valuesSetting2, function(newRequest) {
          queryResult = queryResult + newRequest;
          i++;
          callback();
        });
      }


    },
    function () {
      queryDelete = queryDelete + '0);';
      return done(queryDelete + queryResult);
    });

};

/**
 * createContratLine
 * @description Create a Contrats
 * @param {Object} req
 * @param {Object} res
 */
exports.createContratLine = function (req, res) {
  var contrat = req.contrat;
  createInsertLineSql(contrat, function(newRequest) {
    contratMsSql.insertUpdate(newRequest, function(datas, affected, err) {
      if (err) {
        logger.error('Error occured when save line', newRequest, err);
        return res.status(500).send({
          message: errorHandler.getErrorMessage(err)
        });
      }
      return res.json(contrat);
    });

  });
};

exports.calculValues = calculValues;
