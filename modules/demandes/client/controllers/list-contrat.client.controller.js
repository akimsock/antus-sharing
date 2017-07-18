(function() {
  'use strict';
  angular
    .module('contrats')
    .controller('ContratsListController', ContratsListController);

  ContratsListController.$inject = ['$scope', '$state', 'listeContratEnCours', 'Authentication', '$filter', 'UtilsService', 'AdminService'];
  function ContratsListController($scope, $state, listeContratEnCours, Authentication, $filter, UtilsService, AdminService) {

    // set default value for pagination References Entêtes
    $scope.currentPage = 1;
    $scope.currentPageEnCours = 1;
    $scope.perPage = 8;
    $scope.maxSize = 5;
    // get current user
    var currentUser = Authentication.user;

    // Init filtre contrat model
    $scope.newFiltreContrat = Authentication.user.filterContrat;

    // List contrat for authenticated user
    $scope.listeContratEnCours = $filter('contratListFilter')(listeContratEnCours, Authentication.user.filterContrat, Authentication);
    /**
     * Select Contrat on list contrat
     * @description highlight selected contrat
     * @param {Object} current selected contrat
     * @return {*}
     */
    $scope.setCurrentContrat = function(contrat) {

      $scope.selectedContrat = contrat;
    };

    /**
     * viewAContrat
     * @description view contrat's information
     * @param {Number} contratId current selected contrat
     * @return {*}
     */
    $scope.viewAContrat = function(contratId) {
      $state.go('contrats.view', { contratId: contratId });
    };

    // set the default sort type
    $scope.sortType = 'startDateForNextPeriod';
    // set the default sort order
    $scope.sortReverse = false;

    /**
     * filterContrat
     * @description allows to filter the pacts (contrats)
     * @return {Array}
    */
    $scope.filterContrat = function() {
      var tmpDateString = $scope.newFiltreContrat.contratDateCreated;
      $scope.listeContratEnCours = $filter('contratListFilter')(listeContratEnCours, $scope.newFiltreContrat, Authentication);

      // set the filter in user object
      UtilsService.convertDate(tmpDateString, function(date) {
        $scope.newFiltreContrat.contratDateCreated = date;
        currentUser.filterContrat = $scope.newFiltreContrat;
        // update user
        AdminService.update(currentUser, function() {
          $scope.newFiltreContrat.contratDateCreated = tmpDateString;
        });
      });
    };

    /**
     * cancelFiltre
     * @description Cancel filter
     * @return Void
     */
    $scope.cancelFiltre = function() {
      // cancel filter
      currentUser.filterContrat = {};
      currentUser.filterContrat.customerCode = '';
      currentUser.filterContrat.contratType = '';
      // update user filter
      AdminService.update(currentUser, function() {
        $scope.listeContratEnCours = $filter('contratListFilter')(listeContratEnCours, currentUser.filterContrat, Authentication);
        $scope.newFiltreContrat = currentUser.filterContrat;
      });
    };
  }
}());
