'use strict';

/**
 * Module dependencies
 */
var path = require('path'),
  mongoose = require('mongoose'),
  Demande = mongoose.model('Demande'),
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller'));

/**
 * Create an demande
 */
exports.create = function (req, res) {
  var demande = new Demande(req.body);
  demande.user = req.user;

  demande.save(function (err) {
    if (err) {
      return res.status(422).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.json(demande);
    }
  });
};

/**
 * Show the current demande
 */
exports.read = function (req, res) {
  // convert mongoose document to JSON
  var demande = req.demande ? req.demande.toJSON() : {};

  // Add a custom field to the Demande, for determining if the current User is the "owner".
  // NOTE: This field is NOT persisted to the database, since it doesn't exist in the Demande model.
  demande.isCurrentUserOwner = !!(req.user && demande.user && demande.user._id.toString() === req.user._id.toString());

  res.json(demande);
};

/**
 * Update an demande
 */
exports.update = function (req, res) {
  var demande = req.demande;

  demande.title = req.body.title;
  demande.content = req.body.content;

  demande.save(function (err) {
    if (err) {
      return res.status(422).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.json(demande);
    }
  });
};

/**
 * Delete an demande
 */
exports.delete = function (req, res) {
  var demande = req.demande;

  demande.remove(function (err) {
    if (err) {
      return res.status(422).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.json(demande);
    }
  });
};

/**
 * List of Demandes
 */
exports.list = function (req, res) {
  Demande.find().sort('-created').populate('user', 'displayName').exec(function (err, demandes) {
    if (err) {
      return res.status(422).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.json(demandes);
    }
  });
};

/**
 * Demande middleware
 */
exports.demandeByID = function (req, res, next, id) {

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).send({
      message: 'Demande is invalid'
    });
  }

  Demande.findById(id).populate('user', 'displayName').exec(function (err, demande) {
    if (err) {
      return next(err);
    } else if (!demande) {
      return res.status(404).send({
        message: 'No demande with that identifier has been found'
      });
    }
    req.demande = demande;
    next();
  });
};
