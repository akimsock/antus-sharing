(function () {
  'use strict';

  angular
    .module('contrats')
    .run(menuConfig);

  menuConfig.$inject = ['menuService'];

  function menuConfig(menuService) {
    menuService.addMenuItem('topbar', {
      title: 'Contrats',
      state: 'contrats',
      type: 'dropdown',
      roles: ['user', 'admin']
    });

    // Add the dropdown list item
    menuService.addSubMenuItem('topbar', 'contrats', {
      title: 'menu.contrats.list.label',
      state: 'contrats.list',
      roles: ['user', 'admin']
    });
    menuService.addSubMenuItem('topbar', 'contrats', {
      title: 'menu.contrats.add.label',
      state: 'contrats.create',
      roles: ['user', 'admin']
    });
  }
}());
