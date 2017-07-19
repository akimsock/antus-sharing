(function () {
  'use strict';

  angular
    .module('demandes.admin')
    .controller('DemandesAdminListController', DemandesAdminListController);

  DemandesAdminListController.$inject = ['DemandesService'];

  function DemandesAdminListController(DemandesService) {
    var vm = this;

    vm.demandes = DemandesService.query();
  }
}());
