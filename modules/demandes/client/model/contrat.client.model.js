angular.module('contrats.model').factory('Contrat', ['ClientModel', 'UtilsService',
  /**
   * @description Contrat model
   * @returns {Contrat}
   */
  function (ClientModel, UtilsService) {
    'use strict';
    /**
     *Descript: model's contructor
     * @param data
     * @constructor
     */
    function Contrat(data) {
      data = data.code ? data : { contratHeader: { typeFacturation: { category: {} }, establishment: { modele: { marque: {} } } }, contratParameters: { vehicule: {} } };
      this.code = data.code;
      this.createdDate = data.createdDate || '';
      this.dateModify = data.dateModify || '';
      this.companyCode = data.companyCode || '';
      this.userCode = data.userCode || '';
      this.currencyCode = data.currencyCode || '';
      // Entete contrat
      this.contratHeader = {
        'contratCode': data.contratHeader.contratCode || '',
        'stateContrat': data.contratHeader.stateContrat || '',
        'establishment': {
          'codeEtablissement': data.contratHeader.establishment.codeEtablissement || '',
          'enTeteDocument': data.contratHeader.establishment.enTeteDocument || '',
          'nomEtablissement': data.contratHeader.establishment.nomEtablissement || '',
          'modele': {
            'code': data.contratHeader.establishment.modele.code || '',
            'template': data.contratHeader.establishment.modele.template || '',
            'marque': {
              'markCode': data.contratHeader.establishment.modele.marque.codeMarque || '',
              'description': data.contratHeader.establishment.modele.marque.description || ''
            }
          }
        },
        'typeFacturation': {
          'code': data.contratHeader.typeFacturation.code || '',
          'category': {
            'code': data.contratHeader.typeFacturation.category.code || ''
          },
          'isRequired': data.contratHeader.typeFacturation.isRequired
        },
        'client': new ClientModel(data.contratHeader.client)
      };
      this.lignes = data.lignes || [];
      this.factures = data.factures || [];
      // Params of contrat
      this.contratParameters = {
        'startDate': data.contratParameters.startDate || UtilsService.formatDate(),
        'endDate': data.contratParameters.endDate || '',
        'htAmountGlobal': data.contratParameters.htAmountGlobal || '0.00',
        'ttcInvoiceEdited': data.contratParameters.ttcInvoiceEdited || '0.00',
        'ttcAmountGlobal': data.contratParameters.ttcAmountGlobal || '0.00',
        'deadLineNumber': data.contratParameters.deadLineNumber || '',
        'periodicity': data.contratParameters.periodicity || '',
        'deadLine': data.contratParameters.deadLine || '',
        'startDateForNextPeriod': data.contratParameters.startDateForNextPeriod || '',
        'paymentMode': data.contratParameters.paymentMode || {},
        'numberInvoiceEdited': parseNumberInvoiceEdited(data.contratParameters.numberInvoiceEdited),
        'realNumberInvoiceEdited': data.contratParameters.realNumberInvoiceEdited,
        'vehicule': {
          'code': data.contratParameters.vehicule.code || '',
          'vehiculeModel': data.contratParameters.vehicule.vehiculeModel || '',
          'numImmatriculation': data.contratParameters.vehicule.immatriculation || '',
          'description': data.contratParameters.vehicule.description || '',
          'chassis': data.contratParameters.vehicule.chassis || '',
          'esVO': data.contratParameters.vehicule.esVO || 0,
          'esCourtoisie': data.contratParameters.vehicule.esCourtoisie || 0,
          'carOwner': data.contratParameters.vehicule.carOwner || '',
          'carMark': data.contratParameters.vehicule.carMark || ''
        }
      };
    }
    function parseNumberInvoiceEdited (data) {
      if (!data)
        return parseFloat('0').toFixed(1);
      else
        return parseFloat(data).toFixed(1);
    }
    return Contrat;
  }
]);
