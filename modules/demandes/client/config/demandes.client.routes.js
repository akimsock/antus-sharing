(function () {
  'use strict';

  angular
    .module('demandes.routes')
    .config(routeConfig);

  routeConfig.$inject = ['$stateProvider'];

  function routeConfig($stateProvider) {
    $stateProvider
      .state('demandes', {
        abstract: true,
        url: '/demandes',
        template: '<ui-view/>'
      })
      .state('demandes.list', {
        url: '',
        templateUrl: '/modules/demandes/client/views/list-demandes.client.view.html',
        controller: 'DemandesListController',
        controllerAs: 'vm',
        data: {
          pageTitle: 'Demandes List'
        }
      })
      .state('demandes.view', {
        url: '/:demandeId',
        templateUrl: '/modules/demandes/client/views/view-demande.client.view.html',
        controller: 'DemandesController',
        controllerAs: 'vm',
        resolve: {
          demandeResolve: getDemande
        },
        data: {
          pageTitle: 'Demande {{ demandeResolve.title }}'
        }
      });
  }

  getDemande.$inject = ['$stateParams', 'DemandesService'];

  function getDemande($stateParams, DemandesService) {
    return DemandesService.get({
      demandeId: $stateParams.demandeId
    }).$promise;
  }
}());
