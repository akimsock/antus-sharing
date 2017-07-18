(function() {
  'use strict';
  angular
    .module('contrats')
      .controller('ContratsController', ContratsController);

  ContratsController.$inject = ['$scope', 'contrat', 'etablissements', 'tvas', 'Contrat', 'periodicityValues', 'modeReglment', 'CompteclientService', '$uibModal', 'paymentDead'];
  function ContratsController($scope, contrat, etablissements, tvas, Contrat, periodicityValues, modeReglment, CompteclientService, $uibModal, paymentDead) {
    kendo.culture('fr-FR');
    $scope.contrat = new Contrat(contrat);
    $scope.etablissements = angular.copy(etablissements);
    $scope.tvas = angular.copy(tvas);
    $scope.periodicityValues = angular.copy(periodicityValues);
    $scope.modeReglment = angular.copy(modeReglment);
    $scope.paymentDead = angular.copy(paymentDead);
    /*
     * Set compte client on activity
     * @description Set compte client on activity
     * @returns {*}
     */
    $scope.setCompteClient = function (compteClient) {
      $scope.contrat.contratHeader.client.activity = compteClient;
      $('#invoice-type-select').focus();
    };
  }
}());
