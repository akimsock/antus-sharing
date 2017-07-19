(function () {
  'use strict';

  angular
    .module('demandes.admin')
    .controller('DemandesAdminController', DemandesAdminController);

  DemandesAdminController.$inject = ['$scope', '$state', '$window', 'demandeResolve', 'Authentication', 'Notification'];

  function DemandesAdminController($scope, $state, $window, demande, Authentication, Notification) {
    var vm = this;

    vm.demande = demande;
    vm.authentication = Authentication;
    vm.form = {};
    vm.remove = remove;
    vm.save = save;

    // Remove existing Demande
    function remove() {
      if ($window.confirm('Are you sure you want to delete?')) {
        vm.demande.$remove(function() {
          $state.go('admin.demandes.list');
          Notification.success({ message: '<i class="glyphicon glyphicon-ok"></i> Demande deleted successfully!' });
        });
      }
    }

    // Save Demande
    function save(isValid) {
      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'vm.form.demandeForm');
        return false;
      }

      // Create a new demande, or update the current instance
      vm.demande.createOrUpdate()
        .then(successCallback)
        .catch(errorCallback);

      function successCallback(res) {
        $state.go('admin.demandes.list'); // should we send the User to the list or the updated Demande's view?
        Notification.success({ message: '<i class="glyphicon glyphicon-ok"></i> Demande saved successfully!' });
      }

      function errorCallback(res) {
        Notification.error({ message: res.data.message, title: '<i class="glyphicon glyphicon-remove"></i> Demande save error!' });
      }
    }
  }
}());
