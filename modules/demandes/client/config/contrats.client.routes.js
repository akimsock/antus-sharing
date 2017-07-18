(function () {
  'use strict';

  angular
    .module('contrats.routes')
    .config(routeConfig);

  routeConfig.$inject = ['$stateProvider'];

  function routeConfig($stateProvider) {
    $stateProvider
  .state('contrats', {
    abstract: true,
    url: '/contrats',
    template: '<ui-view/>'
  })
      .state('contrats.list', {
        url: '',
        templateUrl: 'modules/contrats/client/views/list-contrats.client.view.html',
        controller: 'ContratsListController',
        controllerAs: 'vm',
        data: {
          pageTitle: 'Contrats',
          roles: ['admin', 'user']
        },
        resolve: {
          listeContratEnCours: getListContratEnCours
        }
      })
      .state('contrats.create', {
        url: '/create',
        templateUrl: 'modules/contrats/client/views/create-contrats.client.view.html',
        controller: 'ContratsController',
        controllerAs: 'vm',
        resolve: {
          contrat: getContrat,
          etablissements: getEtablissements,
          tvas: getTvas,
          periodicityValues: getPeriodicityValues,
          modeReglment: getmodeReglment,
          paymentDead: getPaymentDead
        },
        data: {
          roles: ['admin', 'user']
        }
      })
      .state('contrats.view', {
        url: '/:contratId',
        templateUrl: 'modules/contrats/client/views/create-contrats.client.view.html',
        controller: 'ContratsController',
        controllerAs: 'vm',
        resolve: {
          contrat: getContrat,
          etablissements: getEtablissements,
          tvas: getTvas,
          periodicityValues: getPeriodicityValues,
          modeReglment: getmodeReglment,
          paymentDead: getPaymentDead
        },
        data: {
          pageTitle: 'Contrats {{ ContratsResolve.title }}',
          roles: ['admin', 'user']
        }
      });
  }
  getListContratEnCours.$inject = ['ContratsService'];
  var CONTRAT_STATE_INPROGRESS = 0;
  function getListContratEnCours(ContratsService) {
    return ContratsService.query({ state: 0 }).$promise.then(function(data) {
      return data;
    });
  }

  getEtablissements.$inject = ['ModelesFactureService'];

  function getEtablissements (ModelesFactureService) {
    return ModelesFactureService.getEtablissementModele().then(function(data) {
      return data;
    });
  }

  getTvas.$inject = ['TvaService'];

  function getTvas (TvaService) {
    return TvaService.query().$promise.then(function(data) {
      return data;
    });
  }

  getContrat.$inject = ['ContratsService', '$stateParams'];

  function getContrat(ContratsService, $stateParams) {
    if ($stateParams.contratId) {
      return ContratsService.get({ contratId: $stateParams.contratId }).$promise.then(function(data) {
        return data;
      });
    } else {
      return {};
    }
  }

  getPeriodicityValues.$inject = ['ContratsService'];

  function getPeriodicityValues(ContratsService) {
    return ContratsService.periodicityList().$promise.then(function(data) {
      return data;
    });
  }

  getmodeReglment.$inject = ['PaymentModeService'];

  function getmodeReglment(PaymentModeService) {
    return PaymentModeService.query().$promise.then(function(data) {
      return data;
    });
  }

  getPaymentDead.$inject = ['PaymentDeadlineService'];
  function getPaymentDead(PaymentDeadlineService) {
    return PaymentDeadlineService.query().$promise.then(function(data) {
      for (var i = 0; i < data.length; i++) {
        data[i].code = parseInt(data[i].code, 10);
      }
      return data;
    });
  }
}());
