(function () {
  'use strict';

  angular
    .module('demandes.services')
    .factory('DemandesService', DemandesService);

  DemandesService.$inject = ['$resource', '$log'];

  function DemandesService($resource, $log) {
    var Demande = $resource('/api/demandes/:demandeId', {
      demandeId: '@_id'
    }, {
      update: {
        method: 'PUT'
      }
    });

    angular.extend(Demande.prototype, {
      createOrUpdate: function () {
        var demande = this;
        return createOrUpdate(demande);
      }
    });

    return Demande;

    function createOrUpdate(demande) {
      if (demande._id) {
        return demande.$update(onSuccess, onError);
      } else {
        return demande.$save(onSuccess, onError);
      }

      // Handle successful response
      function onSuccess(demande) {
        // Any required internal processing from inside the service, goes here.
      }

      // Handle error response
      function onError(errorResponse) {
        var error = errorResponse.data;
        // Handle error internally
        handleError(error);
      }
    }

    function handleError(error) {
      // Log error
      $log.error(error);
    }
  }
}());
