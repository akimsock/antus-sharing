'use strict';

var should = require('should'),
  request = require('supertest'),
  path = require('path'),
  mongoose = require('mongoose'),
  User = mongoose.model('User'),
  Demande = mongoose.model('Demande'),
  express = require(path.resolve('./config/lib/express'));

/**
 * Globals
 */
var app,
  agent,
  credentials,
  user,
  demande;

/**
 * Demande routes tests
 */
describe('Demande CRUD tests', function () {

  before(function (done) {
    // Get application
    app = express.init(mongoose);
    agent = request.agent(app);

    done();
  });

  beforeEach(function (done) {
    // Create user credentials
    credentials = {
      usernameOrEmail: 'username',
      password: 'M3@n.jsI$Aw3$0m3'
    };

    // Create a new user
    user = new User({
      firstName: 'Full',
      lastName: 'Name',
      displayName: 'Full Name',
      email: 'test@test.com',
      username: credentials.usernameOrEmail,
      password: credentials.password,
      provider: 'local'
    });

    // Save a user to the test db and create new demande
    user.save()
      .then(function () {
        demande = {
          title: 'Demande Title',
          content: 'Demande Content'
        };

        done();
      })
      .catch(done);
  });

  it('should not be able to save an demande if logged in without the "admin" role', function (done) {
    agent.post('/api/auth/signin')
      .send(credentials)
      .expect(200)
      .end(function (signinErr, signinRes) {
        // Handle signin error
        if (signinErr) {
          return done(signinErr);
        }

        agent.post('/api/demandes')
          .send(demande)
          .expect(403)
          .end(function (demandeSaveErr, demandeSaveRes) {
            // Call the assertion callback
            done(demandeSaveErr);
          });

      });
  });

  it('should not be able to save an demande if not logged in', function (done) {
    agent.post('/api/demandes')
      .send(demande)
      .expect(403)
      .end(function (demandeSaveErr, demandeSaveRes) {
        // Call the assertion callback
        done(demandeSaveErr);
      });
  });

  it('should not be able to update an demande if signed in without the "admin" role', function (done) {
    agent.post('/api/auth/signin')
      .send(credentials)
      .expect(200)
      .end(function (signinErr, signinRes) {
        // Handle signin error
        if (signinErr) {
          return done(signinErr);
        }

        agent.post('/api/demandes')
          .send(demande)
          .expect(403)
          .end(function (demandeSaveErr, demandeSaveRes) {
            // Call the assertion callback
            done(demandeSaveErr);
          });
      });
  });

  it('should be able to get a list of demandes if not signed in', function (done) {
    // Create new demande model instance
    var demandeObj = new Demande(demande);

    // Save the demande
    demandeObj.save(function () {
      // Request demandes
      request(app).get('/api/demandes')
        .end(function (req, res) {
          // Set assertion
          res.body.should.be.instanceof(Array).and.have.lengthOf(1);

          // Call the assertion callback
          done();
        });

    });
  });

  it('should be able to get a single demande if not signed in', function (done) {
    // Create new demande model instance
    var demandeObj = new Demande(demande);

    // Save the demande
    demandeObj.save(function () {
      request(app).get('/api/demandes/' + demandeObj._id)
        .end(function (req, res) {
          // Set assertion
          res.body.should.be.instanceof(Object).and.have.property('title', demande.title);

          // Call the assertion callback
          done();
        });
    });
  });

  it('should return proper error for single demande with an invalid Id, if not signed in', function (done) {
    // test is not a valid mongoose Id
    request(app).get('/api/demandes/test')
      .end(function (req, res) {
        // Set assertion
        res.body.should.be.instanceof(Object).and.have.property('message', 'Demande is invalid');

        // Call the assertion callback
        done();
      });
  });

  it('should return proper error for single demande which doesnt exist, if not signed in', function (done) {
    // This is a valid mongoose Id but a non-existent demande
    request(app).get('/api/demandes/559e9cd815f80b4c256a8f41')
      .end(function (req, res) {
        // Set assertion
        res.body.should.be.instanceof(Object).and.have.property('message', 'No demande with that identifier has been found');

        // Call the assertion callback
        done();
      });
  });

  it('should not be able to delete an demande if signed in without the "admin" role', function (done) {
    agent.post('/api/auth/signin')
      .send(credentials)
      .expect(200)
      .end(function (signinErr, signinRes) {
        // Handle signin error
        if (signinErr) {
          return done(signinErr);
        }

        agent.post('/api/demandes')
          .send(demande)
          .expect(403)
          .end(function (demandeSaveErr, demandeSaveRes) {
            // Call the assertion callback
            done(demandeSaveErr);
          });
      });
  });

  it('should not be able to delete an demande if not signed in', function (done) {
    // Set demande user
    demande.user = user;

    // Create new demande model instance
    var demandeObj = new Demande(demande);

    // Save the demande
    demandeObj.save(function () {
      // Try deleting demande
      request(app).delete('/api/demandes/' + demandeObj._id)
        .expect(403)
        .end(function (demandeDeleteErr, demandeDeleteRes) {
          // Set message assertion
          (demandeDeleteRes.body.message).should.match('User is not authorized');

          // Handle demande error error
          done(demandeDeleteErr);
        });

    });
  });

  it('should be able to get a single demande that has an orphaned user reference', function (done) {
    // Create orphan user creds
    var _creds = {
      usernameOrEmail: 'orphan',
      password: 'M3@n.jsI$Aw3$0m3'
    };

    // Create orphan user
    var _orphan = new User({
      firstName: 'Full',
      lastName: 'Name',
      displayName: 'Full Name',
      email: 'orphan@test.com',
      username: _creds.usernameOrEmail,
      password: _creds.password,
      provider: 'local',
      roles: ['admin']
    });

    _orphan.save(function (err, orphan) {
      // Handle save error
      if (err) {
        return done(err);
      }

      agent.post('/api/auth/signin')
        .send(_creds)
        .expect(200)
        .end(function (signinErr, signinRes) {
          // Handle signin error
          if (signinErr) {
            return done(signinErr);
          }

          // Get the userId
          var orphanId = orphan._id;

          // Save a new demande
          agent.post('/api/demandes')
            .send(demande)
            .expect(200)
            .end(function (demandeSaveErr, demandeSaveRes) {
              // Handle demande save error
              if (demandeSaveErr) {
                return done(demandeSaveErr);
              }

              // Set assertions on new demande
              (demandeSaveRes.body.title).should.equal(demande.title);
              should.exist(demandeSaveRes.body.user);
              should.equal(demandeSaveRes.body.user._id, orphanId);

              // force the demande to have an orphaned user reference
              orphan.remove(function () {
                // now signin with valid user
                agent.post('/api/auth/signin')
                  .send(credentials)
                  .expect(200)
                  .end(function (err, res) {
                    // Handle signin error
                    if (err) {
                      return done(err);
                    }

                    // Get the demande
                    agent.get('/api/demandes/' + demandeSaveRes.body._id)
                      .expect(200)
                      .end(function (demandeInfoErr, demandeInfoRes) {
                        // Handle demande error
                        if (demandeInfoErr) {
                          return done(demandeInfoErr);
                        }

                        // Set assertions
                        (demandeInfoRes.body._id).should.equal(demandeSaveRes.body._id);
                        (demandeInfoRes.body.title).should.equal(demande.title);
                        should.equal(demandeInfoRes.body.user, undefined);

                        // Call the assertion callback
                        done();
                      });
                  });
              });
            });
        });
    });
  });

  it('should be able to get a single demande if not signed in and verify the custom "isCurrentUserOwner" field is set to "false"', function (done) {
    // Create new demande model instance
    var demandeObj = new Demande(demande);

    // Save the demande
    demandeObj.save(function (err) {
      if (err) {
        return done(err);
      }
      request(app).get('/api/demandes/' + demandeObj._id)
        .end(function (req, res) {
          // Set assertion
          res.body.should.be.instanceof(Object).and.have.property('title', demande.title);
          // Assert the custom field "isCurrentUserOwner" is set to false for the un-authenticated User
          res.body.should.be.instanceof(Object).and.have.property('isCurrentUserOwner', false);
          // Call the assertion callback
          done();
        });
    });
  });

  it('should be able to get single demande, that a different user created, if logged in & verify the "isCurrentUserOwner" field is set to "false"', function (done) {
    // Create temporary user creds
    var _creds = {
      usernameOrEmail: 'demandeowner',
      password: 'M3@n.jsI$Aw3$0m3'
    };

    // Create user that will create the Demande
    var _demandeOwner = new User({
      firstName: 'Full',
      lastName: 'Name',
      displayName: 'Full Name',
      email: 'temp@test.com',
      username: _creds.usernameOrEmail,
      password: _creds.password,
      provider: 'local',
      roles: ['admin', 'user']
    });

    _demandeOwner.save(function (err, _user) {
      // Handle save error
      if (err) {
        return done(err);
      }

      // Sign in with the user that will create the Demande
      agent.post('/api/auth/signin')
        .send(_creds)
        .expect(200)
        .end(function (signinErr, signinRes) {
          // Handle signin error
          if (signinErr) {
            return done(signinErr);
          }

          // Get the userId
          var userId = _user._id;

          // Save a new demande
          agent.post('/api/demandes')
            .send(demande)
            .expect(200)
            .end(function (demandeSaveErr, demandeSaveRes) {
              // Handle demande save error
              if (demandeSaveErr) {
                return done(demandeSaveErr);
              }

              // Set assertions on new demande
              (demandeSaveRes.body.title).should.equal(demande.title);
              should.exist(demandeSaveRes.body.user);
              should.equal(demandeSaveRes.body.user._id, userId);

              // now signin with the test suite user
              agent.post('/api/auth/signin')
                .send(credentials)
                .expect(200)
                .end(function (err, res) {
                  // Handle signin error
                  if (err) {
                    return done(err);
                  }

                  // Get the demande
                  agent.get('/api/demandes/' + demandeSaveRes.body._id)
                    .expect(200)
                    .end(function (demandeInfoErr, demandeInfoRes) {
                      // Handle demande error
                      if (demandeInfoErr) {
                        return done(demandeInfoErr);
                      }

                      // Set assertions
                      (demandeInfoRes.body._id).should.equal(demandeSaveRes.body._id);
                      (demandeInfoRes.body.title).should.equal(demande.title);
                      // Assert that the custom field "isCurrentUserOwner" is set to false since the current User didn't create it
                      (demandeInfoRes.body.isCurrentUserOwner).should.equal(false);

                      // Call the assertion callback
                      done();
                    });
                });
            });
        });
    });
  });

  afterEach(function (done) {
    Demande.remove().exec()
      .then(User.remove().exec())
      .then(done())
      .catch(done);
  });
});
