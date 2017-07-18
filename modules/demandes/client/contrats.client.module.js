(function (app) {
  'use strict';
  app.registerModule('contrats', ['core']);
  app.registerModule('contrats.services', ['ngResource']);
  app.registerModule('contrats.model');
  app.registerModule('contrats.routes');
  app.registerModule('contrats.directives');
  app.registerModule('contrats.filters');
}(ApplicationConfiguration));
