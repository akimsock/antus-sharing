(function() {
  'use strict';
  angular
    .module('contrats.services')
      .factory('ContratsService', ContratsService);

  ContratsService.$inject = ['$resource'];
  function ContratsService($resource) {
    var _url = '/api/contrats/';
    var Contrat = $resource('api/contrats/:contratId', {
      contratId: '@_id'
    }, {
      get: {
        method: 'GET'
      },
      update: {
        method: 'PUT',
        url: 'api/contrats/:contratId'
      },
      delete: {
        method: 'DELETE',
        url: 'api/contrats/:contratId'
      },
      create: {
        method: 'POST',
        url: _url
      },
      edit: {
        method: 'POST',
        url: 'api/contrats/facture/edit'
      },
      periodicityList: {
        method: 'GET',
        url: '/api/periodicityValues',
        isArray: true
      }
    });
    angular.extend(Contrat, {
      save: function (contrat) {
        if (contrat.code) {
          return this.update({
            contratId: contrat.code
          }, contrat).$promise;
        } else {
          return this.create(contrat).$promise;
        }
      },
      deleteContrat: function (contrat) {
        return this.delete({
          contratId: contrat.code
        }).$promise;
      },
      editNextInvoice: function (contrat) {
        return this.edit(contrat).$promise;
      }
    });
    return Contrat;
  }
}());
