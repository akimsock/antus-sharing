(function (app) {
  'use strict';

  app.registerModule('demandes', ['core']);// The core module is required for special route handling; see /core/client/config/core.client.routes
  app.registerModule('demandes.admin', ['core.admin']);
  app.registerModule('demandes.admin.routes', ['core.admin.routes']);
  app.registerModule('demandes.services');
  app.registerModule('demandes.routes', ['ui.router', 'core.routes', 'demandes.services']);
}(ApplicationConfiguration));
