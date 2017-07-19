(function () {
  'use strict';

  angular
    .module('demandes')
    .controller('DemandesListController', DemandesListController);

  DemandesListController.$inject = ['DemandesService'];

  function DemandesListController(DemandesService) {
    var vm = this;

    vm.demandes = DemandesService.query();
  }
}());
