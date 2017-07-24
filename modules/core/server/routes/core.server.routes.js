'use strict';

module.exports = function (app) {
  // Root routing
  var core = require('../controllers/core.server.controller');

  // Define error pages
  app.route('/server-error').get(core.renderServerError);

  // swagger routes
  app.use('/api/docs/swagger', require('express').static(require('path').resolve('./node_modules/swagger-ui/dist')));
  app.use('/api/docs/swagger', require('express').static(require('path').resolve('./public')));


  // Return a 404 for all undefined api, module or lib routes
  app.route('/:url(api|modules|lib)/*').get(core.renderNotFound);

  // Define application route
  app.route('/*').get(core.renderIndex);
};
