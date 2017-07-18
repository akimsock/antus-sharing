'use strict';

/**
 * Module dependencies
 */

var contratsPolicy = require('../policies/contrats.server.policy'),
  contrats = require('../controllers/contrats.server.controller'),
  lines = require('../controllers/lines.contrat.server.controller');

var path = require('path'),
  mssql_database_config = require(path.resolve('./config/lib/mssql_database_config')),
  validationCtrl = require('../controllers/validation.comptable.contrat.server.controller'),
  query = require(path.resolve('./modules/core/server/utils/query'));
var cors = require('cors');
/**
 * query middleware
 */
var getContratQuery = function(req, res, next) {
  req.contratSqlQuery = mssql_database_config.sqlQuery.contrat.getContrats;
  next();
};

module.exports = function (app) {
  // Init i18n for req and res encapsulation
  app.use('/api/contrats*', function(req, res, next) {
    app.get('i18n').init(req, res);
    if (app.get('lang'))
      res.setLocale(app.get('lang'));
    res.header('Access-Control-Allow-Methods', 'GET, PUT, POST, DELETE, OPTIONS');
    next();
  });
  app.use(cors());

  // contrat collection routes
  app.route('/api/contrats').all(contratsPolicy.isAllowed)
    .get(getContratQuery, query, contrats.list)
    .post(contrats.calculValues, contrats.create, lines.calculTotauxLine, lines.createContratLine);

  // contrat collection routes
  app.route('/api/contrats/facture/edit').all(contratsPolicy.isAllowed)
    .post(validationCtrl.validateRequiredFieldsOnContratParameters, validationCtrl.validateRequiredFieldsOnContratHeader, validationCtrl.getCustomerDiversAccount, validationCtrl.validateTypeFacturationContrat, validationCtrl.ifVentilationsIsPresent, validationCtrl.validateContrat, contrats.createInvoiceFromContrat);

  // List periodicity Values route
  app.route('/api/periodicityValues').all(contratsPolicy.isAllowed)
    .get(contrats.periodicityValuesList);

  // Single contrat routes
  app.route('/api/contrats/:codeContrat').all(contratsPolicy.isAllowed)
    .get(contrats.read)
    .put(contrats.calculValues, contrats.update, lines.calculTotauxLine, lines.createContratLine)
    .delete(lines.deleteMultipleContratLine, contrats.delete);

  // Finish by binding the contrat middleware
  app.param('codeContrat', contrats.contratByID);

};
