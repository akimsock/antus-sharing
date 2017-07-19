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
describe('Demande Admin CRUD tests', function () {
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
      roles: ['user', 'admin'],
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

  it('should be able to save an demande if logged in', function (done) {
    agent.post('/api/auth/signin')
      .send(credentials)
      .expect(200)
      .end(function (signinErr, signinRes) {
        // Handle signin error
        if (signinErr) {
          return done(signinErr);
        }

        // Get the userId
        var userId = user.id;

        // Save a new demande
        agent.post('/api/demandes')
          .send(demande)
          .expect(200)
          .end(function (demandeSaveErr, demandeSaveRes) {
            // Handle demande save error
            if (demandeSaveErr) {
              return done(demandeSaveErr);
            }

            // Get a list of demandes
            agent.get('/api/demandes')
              .end(function (demandesGetErr, demandesGetRes) {
                // Handle demande save error
                if (demandesGetErr) {
                  return done(demandesGetErr);
                }

                // Get demandes list
                var demandes = demandesGetRes.body;

                // Set assertions
                (demandes[0].user._id).should.equal(userId);
                (demandes[0].title).should.match('Demande Title');

                // Call the assertion callback
                done();
              });
          });
      });
  });

  it('should be able to update an demande if signed in', function (done) {
    agent.post('/api/auth/signin')
      .send(credentials)
      .expect(200)
      .end(function (signinErr, signinRes) {
        // Handle signin error
        if (signinErr) {
          return done(signinErr);
        }

        // Get the userId
        var userId = user.id;

        // Save a new demande
        agent.post('/api/demandes')
          .send(demande)
          .expect(200)
          .end(function (demandeSaveErr, demandeSaveRes) {
            // Handle demande save error
            if (demandeSaveErr) {
              return done(demandeSaveErr);
            }

            // Update demande title
            demande.title = 'WHY YOU GOTTA BE SO MEAN?';

            // Update an existing demande
            agent.put('/api/demandes/' + demandeSaveRes.body._id)
              .send(demande)
              .expect(200)
              .end(function (demandeUpdateErr, demandeUpdateRes) {
                // Handle demande update error
                if (demandeUpdateErr) {
                  return done(demandeUpdateErr);
                }

                // Set assertions
                (demandeUpdateRes.body._id).should.equal(demandeSaveRes.body._id);
                (demandeUpdateRes.body.title).should.match('WHY YOU GOTTA BE SO MEAN?');

                // Call the assertion callback
                done();
              });
          });
      });
  });

  it('should not be able to save an demande if no title is provided', function (done) {
    // Invalidate title field
    demande.title = '';

    agent.post('/api/auth/signin')
      .send(credentials)
      .expect(200)
      .end(function (signinErr, signinRes) {
        // Handle signin error
        if (signinErr) {
          return done(signinErr);
        }

        // Get the userId
        var userId = user.id;

        // Save a new demande
        agent.post('/api/demandes')
          .send(demande)
          .expect(422)
          .end(function (demandeSaveErr, demandeSaveRes) {
            // Set message assertion
            (demandeSaveRes.body.message).should.match('Title cannot be blank');

            // Handle demande save error
            done(demandeSaveErr);
          });
      });
  });

  it('should be able to delete an demande if signed in', function (done) {
    agent.post('/api/auth/signin')
      .send(credentials)
      .expect(200)
      .end(function (signinErr, signinRes) {
        // Handle signin error
        if (signinErr) {
          return done(signinErr);
        }

        // Get the userId
        var userId = user.id;

        // Save a new demande
        agent.post('/api/demandes')
          .send(demande)
          .expect(200)
          .end(function (demandeSaveErr, demandeSaveRes) {
            // Handle demande save error
            if (demandeSaveErr) {
              return done(demandeSaveErr);
            }

            // Delete an existing demande
            agent.delete('/api/demandes/' + demandeSaveRes.body._id)
              .send(demande)
              .expect(200)
              .end(function (demandeDeleteErr, demandeDeleteRes) {
                // Handle demande error error
                if (demandeDeleteErr) {
                  return done(demandeDeleteErr);
                }

                // Set assertions
                (demandeDeleteRes.body._id).should.equal(demandeSaveRes.body._id);

                // Call the assertion callback
                done();
              });
          });
      });
  });

  it('should be able to get a single demande if signed in and verify the custom "isCurrentUserOwner" field is set to "true"', function (done) {
    // Create new demande model instance
    demande.user = user;
    var demandeObj = new Demande(demande);

    agent.post('/api/auth/signin')
      .send(credentials)
      .expect(200)
      .end(function (signinErr, signinRes) {
        // Handle signin error
        if (signinErr) {
          return done(signinErr);
        }

        // Get the userId
        var userId = user.id;

        // Save a new demande
        agent.post('/api/demandes')
          .send(demande)
          .expect(200)
          .end(function (demandeSaveErr, demandeSaveRes) {
            // Handle demande save error
            if (demandeSaveErr) {
              return done(demandeSaveErr);
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

                // Assert that the "isCurrentUserOwner" field is set to true since the current User created it
                (demandeInfoRes.body.isCurrentUserOwner).should.equal(true);

                // Call the assertion callback
                done();
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
