(function () {
  'use strict';

  angular
    .module('demandes.admin.routes')
    .config(routeConfig);

  routeConfig.$inject = ['$stateProvider'];

  function routeConfig($stateProvider) {
    $stateProvider
      .state('admin.demandes', {
        abstract: true,
        url: '/demandes',
        template: '<ui-view/>'
      })
      .state('admin.demandes.list', {
        url: '',
        templateUrl: '/modules/demandes/client/views/admin/list-demandes.client.view.html',
        controller: 'DemandesAdminListController',
        controllerAs: 'vm',
        data: {
          roles: ['admin']
        }
      })
      .state('admin.demandes.create', {
        url: '/create',
        templateUrl: '/modules/demandes/client/views/admin/form-demande.client.view.html',
        controller: 'DemandesAdminController',
        controllerAs: 'vm',
        data: {
          roles: ['admin']
        },
        resolve: {
          demandeResolve: newDemande
        }
      })
      .state('admin.demandes.edit', {
        url: '/:demandeId/edit',
        templateUrl: '/modules/demandes/client/views/admin/form-demande.client.view.html',
        controller: 'DemandesAdminController',
        controllerAs: 'vm',
        data: {
          roles: ['admin']
        },
        resolve: {
          demandeResolve: getDemande
        }
      });
  }

  getDemande.$inject = ['$stateParams', 'DemandesService'];

  function getDemande($stateParams, DemandesService) {
    return DemandesService.get({
      demandeId: $stateParams.demandeId
    }).$promise;
  }

  newDemande.$inject = ['DemandesService'];

  function newDemande(DemandesService) {
    return new DemandesService();
  }
}());
