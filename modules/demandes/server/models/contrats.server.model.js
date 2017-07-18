'use strict';

/**
 * Module dependencies
 */
var path = require('path'),
  Client = require(path.resolve('./modules/clients/server/models/clients.server.model'));


/**
 * Contrat model
 */
var Contrat = function(data) {
  this.data.code = data.contCode;
  this.data.createdDate = data.createdDate;
  this.data.dateModify = data.dateModif;
  this.data.companyCode = data.contCompCode;
  this.data.userCode = data.contUserCode;
  this.data.currencyCode = data.contCurrCode;
  // Entete contrat
  this.data.contratHeader = {
    'contratCode': data.contContratCode,
    'stateContrat': data.contState,
    'establishment': {
      'codeEtablissement': data.contEstCode,
      'enTeteDocument': data.contHder,
      'nomEtablissement': data.contNameEst,
      'modele': {
        'code': data.contModelCode,
        'template': data.contTemplate,
        'marque': {
          'codeMarque': data.contMarkCode,
          'description': data.contMarkDesc
        }
      }
    },
    'typeFacturation': {
      'code': data.contTypInv,
      'category': {
        'code': data.tyType
      },
      'isRequired': data.tyAnaRequired
    },
    'client': new Client(data).getData()
  };

  // Params of contrat
  this.data.contratParameters = {
    'startDate': data.startDate,
    'endDate': data.endDate,
    'htAmountGlobal': data.contHtAmountGlobal,
    'ttcAmountGlobal': data.contTtcAmountGlobal,
    'ttcInvoiceEdited': data.contTtcInvoiceEdited,
    'deadLineNumber': data.contDeadLineNumber,
    'periodicity': data.contPeriodicity,
    'deadLine': data.contDeadLine,
    'startDateForNextPeriod': data.startDateForNextPeriod,
    'paymentMode': { 'code': data.contPaymentMode },
    'numberInvoiceEdited': data.contNumberInvoiceEdited,
    'realNumberInvoiceEdited': data.contRealNumberInvoiceEdited,
    'vehicule': {
      'code': data.contCarCode,
      'vehiculeModel': data.contCarModel,
      'numImmatriculation': data.contCarImmatriculation,
      'description': data.contCarDescription,
      'chassis': data.contCarChassis,
      'esVO': data.contCarEsVO,
      'esCourtoisie': data.contCarEsCourtoisie,
      'carOwner': data.contCarChassis,
      'carMark': data.contCarMark
    }
  };
};

Contrat.prototype.data = {};

Contrat.prototype.set = function (name, value) {
  this.data[name] = value;
};
Contrat.prototype.getData = function() {
  return JSON.parse(JSON.stringify(this.data));
};

module.exports = Contrat;

