(function () {
  'use strict';

  angular
    .module('demandes')
    .controller('DemandesController', DemandesController);

  DemandesController.$inject = ['$scope', 'demandeResolve', 'Authentication'];

  function DemandesController($scope, demande, Authentication) {
    var vm = this;

    vm.demande = demande;
    vm.authentication = Authentication;

  }
}());
