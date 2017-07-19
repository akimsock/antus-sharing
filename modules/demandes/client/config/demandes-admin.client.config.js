(function () {
  'use strict';

  // Configuring the Demandes Admin module
  angular
    .module('demandes.admin')
    .run(menuConfig);

  menuConfig.$inject = ['menuService'];

  function menuConfig(Menus) {
    Menus.addSubMenuItem('topbar', 'admin', {
      title: 'Manage Demandes',
      state: 'admin.demandes.list'
    });
  }
}());
