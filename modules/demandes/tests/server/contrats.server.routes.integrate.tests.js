'use strict';

var should = require('should'),
  request = require('supertest'),
  path = require('path'),
  mongoose = require('mongoose'),
  User = mongoose.model('User'),
  express = require(path.resolve('./config/lib/express')),
  logger = require(path.resolve('./config/lib/logger')),
  msSQLClient = require(path.resolve('./modules/core/server/utils/mssql/index.mssql.utils.js'));

/**
 * Globals
 */
var app,
  agent,
  credentials,
  contrat,
  basicContrat,
  contrat2,
  user,
  ventLabelMock,
  ventMock,
  typeFactMock,
  typeFactId;

/**
 * Contrat routes tests
 */
describe('Contrat CRUD tests', function () {

  before(function (done) {
    // Get application
    msSQLClient.getconnect(function (msSqlDb) {
      app = express.init(mongoose, msSqlDb);
      agent = request.agent(app);

      // init obejects
      ventLabelMock = { 'code': 'WDG', 'wording': 'Test Unitaire', 'society': '001' };
      typeFactMock = { 'libelle': 'test&&&&&2006', 'currentCompany': '001', 'journal': { 'code': 'JV' }, 'category': { 'code': 0 }, 'mask': { 'code': 1 }, 'isRequired': 1, 'avoirNegatif': 0, 'account': '77885', 'subAccount': '9145', 'discountAccount': '985', 'discountAnalytic': '478', 'tva': { 'codeTVA': 'b' } };
      ventMock = { 'comptableMask': '512*', 'analyticalMask': '253*', 'comptableDiscountMask': '11*', 'analyticalDiscountMask': '11*', 'society': '001', 'libelleVentilation': { 'id': 0, 'code': 'TST', 'wording': 'libelleVentilation Test' } };

      contrat = { 'createdDate': '15/03/2017', 'dateModify': null, 'companyCode': '001', 'userCode': 'administrador', 'currencyCode': '099', 'contratHeader': { 'stateContrat': 1, 'establishment': { 'codeEtablissement': '11 ', 'nomEtablissement': 'nomEtablissement ', 'enTeteDocument': 'enTeteDocument', 'modele': { 'code': null, 'marque': { 'codeMarque': null, 'description': null } } }, 'typeFacturation': { 'code': 11 }, 'client': { 'codeClient': 1077, 'activity': { 'account': '4115000', 'subAccount': '01403', 'activity': 'div', 'paymentMode': {}, 'paymentDeadline': {}, 'dayPayment': 0 }, 'numeroTvaIntraComUe': null, 'estClientDePassage': 1, 'estClientComptant': 1, 'civilite': null, 'nomClient': 'lastName 73', 'prenomClient': 'firstName 73', 'codePostal': null, 'ville': null, 'pays': null, 'tel1': null, 'domicile': null, 'mobile': null, 'telecopi': null, 'email': null, 'siret': null, 'titre': null, 'complement': null, 'adresse': null, 'voieAdresse': null, 'numAdresse': null, 'departement': null, 'complementCommande': { 'reference': '', 'responsable': '', 'serviceEmetteur': '', 'numTelephone': '', 'numClient': '', 'compteClient': '', 'attention': '', 'regularisation': '', 'personToContact': '', 'vehiculeModel': '', 'numImmatriculation': '', 'chassis': '' } } }, 'contratParameters': { 'contratNumber': '7', 'startDate': '15/03/2017', 'endDate': '', 'ttcAmountGlobal': 0, 'deadLineNumber': 5, 'periodicity': 5, 'deadLine': 1, 'startDateForNextPeriod': '', 'numberInvoiceEdited': 0, 'realNumberInvoiceEdited': 0, 'paymentMode': { 'code': null }, 'vehicule': { 'code': null, 'model': null, 'immatriculation': null, 'chassis': null, 'description': '' } }, 'lignes': [{ 'idContrat': 12, 'codeComptable': '512', 'position': 1, 'linkPreformattedComment': 0, 'linkPreformattedLibelle': 0, 'codeAnaltic': '253', 'typeCompte': 'CA ', 'typeCompeRm': 'CA ', 'libelle': 'juste un test', 'commentaire': '', 'prixUnit': 100, 'quantite': 1, 'tauxRemise': 0, 'prixNet': 100, 'mntRm': 2, 'totalHT': 200, 'totalTTC': 250, 'preformattedData': '2', 'tva': { 'codeTVA': '2', 'taux': 2, 'mntTva': 200, 'compte': '2', 'sousCompte': '2' } }], 'taxes': [{ 'codeTVA': '2', 'taux': 2, 'mntTva': 200, 'mntHT': 200, 'mntTTC': 250, 'compte': '2', 'sousCompte': '2' }] };

      contrat2 = { 'createdDate': '15/03/2017', 'dateModify': null, 'companyCode': '001', 'userCode': 'administrador', 'currencyCode': '099', 'contratHeader': { 'stateContrat': 1, 'establishment': { 'codeEtablissement': '11 ', 'nomEtablissement': 'nomEtablissement ', 'enTeteDocument': 'enTeteDocument', 'modele': { 'code': null, 'marque': { 'codeMarque': null, 'description': null } } }, 'typeFacturation': { 'code': 11 }, 'client': { 'codeClient': 1077, 'activity': { 'account': '4115000', 'subAccount': '01403', 'activity': 'div', 'paymentMode': {}, 'paymentDeadline': {}, 'dayPayment': 0 }, 'numeroTvaIntraComUe': null, 'estClientDePassage': 1, 'estClientComptant': 1, 'civilite': null, 'nomClient': 'lastName 73', 'prenomClient': 'firstName 73', 'codePostal': null, 'ville': null, 'pays': null, 'tel1': null, 'domicile': null, 'mobile': null, 'telecopi': null, 'email': null, 'siret': null, 'titre': null, 'complement': null, 'adresse': null, 'voieAdresse': null, 'numAdresse': null, 'departement': null, 'complementCommande': { 'reference': '', 'responsable': '', 'serviceEmetteur': '', 'numTelephone': '', 'numClient': '', 'compteClient': '', 'attention': '', 'regularisation': '', 'personToContact': '', 'vehiculeModel': '', 'numImmatriculation': '', 'chassis': '' } } }, 'contratParameters': { 'contratNumber': '7', 'startDate': '15/03/2017', 'endDate': '', 'ttcAmountGlobal': 0, 'deadLineNumber': 5, 'periodicity': 5, 'deadLine': 1, 'startDateForNextPeriod': '', 'numberInvoiceEdited': 0, 'realNumberInvoiceEdited': 0, 'paymentMode': { 'code': null }, 'vehicule': { 'code': null, 'model': null, 'immatriculation': null, 'chassis': null, 'description': '' } }, 'lignes': [{ 'idContrat': 12, 'codeComptable': '512', 'position': 1, 'codeAnaltic': '253', 'typeCompte': 'CA ', 'typeCompeRm': 'CA ', 'libelle': 'juste un test', 'commentaire': '', 'prixUnit': 100, 'quantite': 1, 'tauxRemise': 0, 'prixNet': 100, 'mntRm': 2, 'totalHT': 200, 'totalTTC': 250, 'preformattedData': '2', 'tva': { 'codeTVA': '2', 'taux': 2, 'mntTva': 200, 'compte': '2', 'sousCompte': '2' } }], 'taxes': [{ 'codeTVA': '2', 'taux': 2, 'mntTva': 200, 'mntHT': 200, 'mntTTC': 250, 'compte': '2', 'sousCompte': '2' }] };

      basicContrat = { 'createdDate': '30/03/2017', 'dateModify': null, 'companyCode': '   ', 'userCode': 'administrador', 'currencyCode': '', 'contratHeader': { 'contratCode': '', 'stateContrat': 0, 'establishment': { 'codeEtablissement': '', 'enTeteDocument': '', 'nomEtablissement': '', 'modele': { 'code': null, 'marque': { 'codeMarque': '', 'description': '' } } }, 'typeFacturation': { 'code': null, 'category': { 'code': null }, 'isRequired': null }, 'client': { 'codeClient': 0, 'activity': { 'account': '', 'subAccount': '', 'activity': 'div', 'paymentMode': { }, 'paymentDeadline': { }, 'dayPayment': 0 }, 'numeroTvaIntraComUe': '', 'estClientDePassage': 0, 'estClientComptant': 0, 'civilite': '', 'nomClient': '', 'prenomClient': '', 'codePostal': '', 'ville': '', 'pays': '', 'tel1': '', 'domicile': '', 'mobile': '', 'telecopi': '', 'email': '', 'siret': ' ', 'titre': '', 'complement': '', 'adresse': '', 'voieAdresse': '', 'numAdresse': '', 'departement': '', 'complementCommande': { 'reference': '', 'responsable': '', 'serviceEmetteur': '', 'numTelephone': '', 'numClient': '', 'compteClient': '', 'attention': '', 'regularisation': '', 'personToContact': '', 'vehiculeModel': '', 'numImmatriculation': '', 'chassis': '' } } }, 'contratParameters': { 'contratNumber': '', 'startDate': '30/03/2017', 'endDate': null, 'htAmountGlobal': null, 'deadLineNumber': null, 'periodicity': 5, 'deadLine': null, 'startDateForNextPeriod': null, 'paymentMode': {}, 'numberInvoiceEdited': 0, 'realNumberInvoiceEdited': 0, 'vehicule': { 'code': '', 'vehiculeModel': '', 'numImmatriculation': '', 'chassis': '', 'description': '' } }, 'lignes': [], 'taxes': [], 'factures': [] };

      // delete all datas
      msSQLClient.insertUpdate('DELETE FROM dvContratLine ', function() {});
      msSQLClient.insertUpdate('DELETE FROM dvContrat ', done);
    });
  });

  beforeEach(function (done) {
    // Create user credentials
    credentials = {
      usernameOrEmail: 'usernameContrat',
      password: 'M3@n.jsI$Aw3$0m3',
      roles: ['admin'],
      currentCompany: '001',
      defaultCompany: '001'
    };

    // Create a new user
    user = new User({
      firstName: 'Full',
      lastName: 'Name',
      displayName: 'Full Name',
      email: 'test@test.com',
      username: credentials.usernameOrEmail,
      password: credentials.password
    });

    // Save a user to the test db
    user.save(function () {
      done();
    });
  });

  it('Can\'t create invoice from contrat without contrat parameters', function(done) {
    agent.post('/api/auth/signin')
      .send(credentials)
      .expect(200)
      .end(function (signinErr, signinRes) {
        // Handle signin error
        if (signinErr) {
          return done(signinErr);
        }
        // save a contrat
        agent.post('/api/contrats')
          .send(contrat)
          .expect(200)
          .end(function (errContrat, resContrat) {
            if (errContrat) {
              return done(errContrat);
            }
            contrat = resContrat.body;
            var contratParameter = contrat.contratParameters;
            contrat.contratParameters = {};
            agent.post('/api/contrats/facture/edit')
              .send(contrat)
              .expect(412)
              .end(function (err, res) {
                if (err) {
                  return done(err);
                }
                // Call the assertion callback
                res.body.should.be.instanceof(Object);
                should.exist(res.body);
                should.equal(res.body.code, '412.1');
                contrat.contratParameters = contratParameter;
                done();
              });
          });
      });
  });

  it('Can\'t create invoice from contrat without contrat header', function(done) {
    agent.post('/api/auth/signin')
      .send(credentials)
      .expect(200)
      .end(function (signinErr, signinRes) {
        // Handle signin error
        if (signinErr) {
          return done(signinErr);
        }
        // save a contrat
        agent.post('/api/contrats')
          .send(contrat)
          .expect(200)
          .end(function (errContrat, resContrat) {
            if (errContrat) {
              return done(errContrat);
            }
            contrat = resContrat.body;
            var contratHeader = contrat.contratHeader;
            contrat.contratHeader = {};
            agent.post('/api/contrats/facture/edit')
              .send(contrat)
              .expect(412)
              .end(function (err, res) {
                if (err) {
                  return done(err);
                }
                // Call the assertion callback
                res.body.should.be.instanceof(Object);
                should.exist(res.body);
                should.equal(res.body.code, '412.2');
                contrat.contratHeader = contratHeader;
                done();
              });
          });
      });
  });

  it('Can\'t create invoice from contrat without contrat header', function(done) {
    agent.post('/api/auth/signin')
      .send(credentials)
      .expect(200)
      .end(function (signinErr, signinRes) {
        // Handle signin error
        if (signinErr) {
          return done(signinErr);
        }
        // save a contrat
        agent.post('/api/contrats')
          .send(contrat)
          .expect(200)
          .end(function (errContrat, resContrat) {
            if (errContrat) {
              return done(errContrat);
            }
            contrat = resContrat.body;
            var codeClient = contrat.contratHeader.client.codeClient;
            contrat.contratHeader.client.codeClient = 1;
            agent.post('/api/contrats/facture/edit')
              .send(contrat)
              .expect(412)
              .end(function (err, res) {
                if (err) {
                  return done(err);
                }
                // Call the assertion callback
                res.body.should.be.instanceof(Object);
                should.exist(res.body);
                should.equal(res.body.code, '412.3');
                contrat.contratHeader.client.codeClient = codeClient;
                done();
              });
          });
      });
  });

  it('should able to delete a contrat and lines', function(done) {
    agent.post('/api/auth/signin')
      .send(credentials)
      .expect(200)
      .end(function (signinErr, signinRes) {
        // Handle signin error
        if (signinErr) {
          return done(signinErr);
        }
        // save a wording
        agent.post('/api/wordings')
          .send(ventLabelMock)
          .expect(200)
          .end(function (errWording, resWording) {
            if (errWording) {
              return done(errWording);
            }
            // save a type invoice
            agent.post('/api/typeinvoice')
              .send(typeFactMock)
              .expect(200)
              .end(function (errTypeinvoice, resTypeinvoice) {
                if (errTypeinvoice) {
                  return done(errTypeinvoice);
                }
                contrat2.contratHeader.typeFacturation = { 'code': resTypeinvoice.body.code, 'category': { 'code': null }, 'isRequired': null, 'avoirNegatif': 0 };
                var tmpcomptableMask = ventMock.comptableMask;
                ventMock.facturationType = {
                  'code': resTypeinvoice.body.code,
                  'libelle': resTypeinvoice.body.libelle
                };
                agent.post('/api/ventilations')
                  .send(ventMock)
                  .expect(200)
                  .end(function (errVentilation, resVentilation) {
                    if (errVentilation) {
                      return done(errVentilation);
                    }
                    // save a contrat
                    agent.post('/api/contrats')
                      .send(contrat2)
                      .expect(200)
                      .end(function (err, res) {
                        if (err) {
                          return done(err);
                        }
                        contrat2 = res.body;
                        agent.delete('/api/contrats/' + contrat2.code)
                          .end(function(errContr, resContr) {
                            if (errContr) {
                              return done(errContr);
                            }
                            should.equal(resContr.statusCode, 200);
                            done();
                          });
                      });
                  });
              });
          });
      });
  });

  it('Can\'t edit invoice create from contrat without type invoice', function(done) {
    agent.post('/api/auth/signin')
      .send(credentials)
      .expect(200)
      .end(function (signinErr, signinRes) {
        // Handle signin error
        if (signinErr) {
          return done(signinErr);
        }
        contrat.contratHeader.typeFacturation = { 'code': 0, 'category': { 'code': null }, 'isRequired': null, 'avoirNegatif': 0 };
        contrat.contratParameters = { 'deadLine': '2', 'deadLineNumber': '11', 'endDate': '', 'htAmountGlobal': '0.00', 'numberInvoiceEdited': '0.0', 'realNumberInvoiceEdited': '0', 'paymentMode': { 'code': '1 ', 'description': 'Chèque ' }, 'code': '1  ', 'description': 'Chèque                             ', 'periodicity': '1', 'startDate': '01/07/2017', 'startDateForNextPeriod': '', 'ttcAmountGlobal': '0.00', 'ttcInvoiceEdited': '0.00' };

        // save a contrat
        agent.post('/api/contrats')
          .send(contrat)
          .expect(200)
          .end(function (errContrat, resContrat) {
            if (errContrat) {
              return done(errContrat);
            }
            contrat = resContrat.body;
            agent.post('/api/contrats/facture/edit')
              .send(contrat)
              .expect(500)
              .end(function (err, res) {
                if (err) {
                  return done(err);
                }

                // Call the assertion callback
                res.body.should.be.instanceof(Object);
                should.exist(res.body);
                should.equal(res.body.code, '500.5');
                done();
              });
          });
      });
  });

  it('Can\'t edit invoice create from contrat without ventilations', function(done) {
    agent.post('/api/auth/signin')
      .send(credentials)
      .expect(200)
      .end(function (signinErr, signinRes) {
        // Handle signin error
        if (signinErr) {
          return done(signinErr);
        }
        // save a type invoice
        agent.post('/api/typeinvoice')
          .send(typeFactMock)
          .expect(200)
          .end(function (errTypeinvoice, resTypeinvoice) {
            if (errTypeinvoice) {
              return done(errTypeinvoice);
            }
            contrat.contratHeader.typeFacturation = { 'code': resTypeinvoice.body.code, 'category': { 'code': null }, 'isRequired': null, 'avoirNegatif': 0 };
            // save a contrat
            agent.post('/api/contrats')
              .send(contrat)
              .expect(200)
              .end(function (errContrat, resContrat) {
                if (errContrat) {
                  return done(errContrat);
                }
                contrat = resContrat.body;
                agent.post('/api/contrats/facture/edit')
                  .send(contrat)
                  .expect(500)
                  .end(function (err, res) {
                    if (err) {
                      return done(err);
                    }
                    // Call the assertion callback
                    res.body.should.be.instanceof(Object);
                    should.exist(res.body);
                    should.equal(res.body.code, '500.3');
                    done();
                  });
              });
          });
      });
  });

  it('Can\'t edit invoice create from contrat without invalid ventilations', function(done) {
    agent.post('/api/auth/signin')
      .send(credentials)
      .expect(200)
      .end(function (signinErr, signinRes) {
        // Handle signin error
        if (signinErr) {
          return done(signinErr);
        }
        // save a type invoice
        agent.post('/api/typeinvoice')
          .send(typeFactMock)
          .expect(200)
          .end(function (errTypeinvoice, resTypeinvoice) {
            if (errTypeinvoice) {
              return done(errTypeinvoice);
            }

            var comptableMask = ventMock.comptableMask;
            var analyticalMask = ventMock.analyticalMask;
            var comptableDiscountMask = ventMock.comptableDiscountMask;
            var analyticalDiscountMask = ventMock.analyticalDiscountMask;
            ventMock.comptableMask = '0000';
            ventMock.analyticalMask = '0000';
            ventMock.comptableDiscountMask = '0000';
            ventMock.analyticalDiscountMask = '0000';

            contrat.contratHeader.typeFacturation = { 'code': resTypeinvoice.body.code, 'category': { 'code': null }, 'isRequired': null, 'avoirNegatif': 0 };
            ventMock.facturationType = {
              'code': resTypeinvoice.body.code,
              'libelle': resTypeinvoice.body.libelle
            };
            agent.post('/api/ventilations')
              .send(ventMock)
              .expect(200)
              .end(function (errVentilation, resVentilation) {
                if (errVentilation) {
                  return done(errVentilation);
                }
                // save a contrat
                agent.post('/api/contrats')
                  .send(contrat)
                  .expect(200)
                  .end(function (errContrat, resContrat) {
                    if (errContrat) {
                      return done(errContrat);
                    }
                    contrat = resContrat.body;
                    agent.post('/api/contrats/facture/edit')
                      .send(contrat)
                      .expect(500)
                      .end(function (err, res) {
                        if (err) {
                          return done(err);
                        }
                        // Call the assertion callback
                        res.body.should.be.instanceof(Object);
                        should.exist(res.body);
                        should.equal(res.body.code, '500.4');
                        ventMock.comptableMask = comptableMask;
                        ventMock.analyticalMask = analyticalMask;
                        ventMock.comptableDiscountMask = comptableDiscountMask;
                        ventMock.analyticalDiscountMask = analyticalDiscountMask;
                        done();
                      });
                  });
              });
          });
      });
  });

  it('Can\'t  a contrat with invalid data (ex dateModify = 111)', function(done) {
    agent.post('/api/auth/signin')
      .send(credentials)
      .expect(200)
      .end(function (signinErr, signinRes) {
        // Handle signin error
        if (signinErr) {
          return done(signinErr);
        }
        // save a wording
        agent.post('/api/wordings')
          .send(ventLabelMock)
          .expect(200)
          .end(function (errWording, resWording) {
            if (errWording) {
              return done(errWording);
            }
            // save a type invoice
            agent.post('/api/typeinvoice')
              .send(typeFactMock)
              .expect(200)
              .end(function (errTypeinvoice, resTypeinvoice) {
                if (errTypeinvoice) {
                  return done(errTypeinvoice);
                }
                contrat.contratHeader.typeFacturation = { 'code': resTypeinvoice.body.code, 'category': { 'code': null }, 'isRequired': null, 'avoirNegatif': 0 };
                var tmpcomptableMask = ventMock.comptableMask;
                ventMock.facturationType = {
                  'code': resTypeinvoice.body.code,
                  'libelle': resTypeinvoice.body.libelle
                };
                agent.post('/api/ventilations')
                  .send(ventMock)
                  .expect(200)
                  .end(function (errVentilation, resVentilation) {
                    if (errVentilation) {
                      return done(errVentilation);
                    }
                    basicContrat.dateModify = 111;
                    // save a contrat
                    agent.post('/api/contrats')
                      .send(basicContrat)
                      .expect(500)
                      .end(function (err, res) {
                        if (err) {
                          return done(err);
                        }
                        // Call the assertion callback
                        should.exist(res.body);
                        res.body.should.be.instanceof(Object);
                        should.equal(res.statusCode, 500);
                        basicContrat.dateModify = null;
                        done();
                      });
                  });
              });
          });
      });
  });

  it('should able to Add a contrat', function(done) {
    agent.post('/api/auth/signin')
      .send(credentials)
      .expect(200)
      .end(function (signinErr, signinRes) {
        // Handle signin error
        if (signinErr) {
          return done(signinErr);
        }
        // save a wording
        agent.post('/api/wordings')
          .send(ventLabelMock)
          .expect(200)
          .end(function (errWording, resWording) {
            if (errWording) {
              return done(errWording);
            }
            // save a type invoice
            agent.post('/api/typeinvoice')
              .send(typeFactMock)
              .expect(200)
              .end(function (errTypeinvoice, resTypeinvoice) {
                if (errTypeinvoice) {
                  return done(errTypeinvoice);
                }
                contrat.contratHeader.typeFacturation = { 'code': resTypeinvoice.body.code, 'category': { 'code': null }, 'isRequired': null, 'avoirNegatif': 0 };
                var tmpcomptableMask = ventMock.comptableMask;
                ventMock.facturationType = {
                  'code': resTypeinvoice.body.code,
                  'libelle': resTypeinvoice.body.libelle
                };
                agent.post('/api/ventilations')
                  .send(ventMock)
                  .expect(200)
                  .end(function (errVentilation, resVentilation) {
                    if (errVentilation) {
                      return done(errVentilation);
                    }
                    // save a contrat
                    agent.post('/api/contrats')
                      .send(basicContrat)
                      .expect(200)
                      .end(function (err, res) {
                        if (err) {
                          return done(err);
                        }
                        // Call the assertion callback
                        res.body.should.be.instanceof(Object);
                        should.exist(res.body);
                        should.exist(res.body.code);
                        // contrat = res.body;
                        done();
                      });
                  });
              });
          });
      });
  });

  it('Update a contrat', function(done) {
    agent.post('/api/auth/signin')
      .send(credentials)
      .expect(200)
      .end(function (signinErr, signinRes) {
        // Handle signin error
        if (signinErr) {
          return done(signinErr);
        }
        // save a wording
        agent.post('/api/wordings')
          .send(ventLabelMock)
          .expect(200)
          .end(function (errWording, resWording) {
            if (errWording) {
              return done(errWording);
            }
            // save a type invoice
            agent.post('/api/typeinvoice')
              .send(typeFactMock)
              .expect(200)
              .end(function (errTypeinvoice, resTypeinvoice) {
                if (errTypeinvoice) {
                  return done(errTypeinvoice);
                }
                contrat.contratHeader.typeFacturation = { 'code': resTypeinvoice.body.code, 'category': { 'code': null }, 'isRequired': null, 'avoirNegatif': 0 };
                var tmpcomptableMask = ventMock.comptableMask;
                ventMock.facturationType = {
                  'code': resTypeinvoice.body.code,
                  'libelle': resTypeinvoice.body.libelle
                };
                agent.post('/api/ventilations')
                  .send(ventMock)
                  .expect(200)
                  .end(function (errVentilation, resVentilation) {
                    if (errVentilation) {
                      return done(errVentilation);
                    }
                    // save a contrat
                    agent.post('/api/contrats')
                      .send(basicContrat)
                      .expect(200)
                      .end(function (err, res) {
                        if (err) {
                          return done(err);
                        }
                        res.body.dateModify = '15/03/2017';
                        agent.put('/api/contrats/' + res.body.code)
                          .send(res.body)
                          .expect(200)
                          .end(function (errUpdate, resUpdate) {
                            if (errUpdate) {
                              return done(errUpdate);
                            }
                            // Call the assertion callback
                            should.exist(resUpdate.body);
                            should.equal(res.body.dateModify, '15/03/2017');
                            done();
                          });
                      });
                  });
              });
          });
      });
  });

  it('Can\'t update a contrat with an invalid data', function(done) {
    agent.post('/api/auth/signin')
      .send(credentials)
      .expect(200)
      .end(function (signinErr, signinRes) {
        // Handle signin error
        if (signinErr) {
          return done(signinErr);
        }
        // save a wording
        agent.post('/api/wordings')
          .send(ventLabelMock)
          .expect(200)
          .end(function (errWording, resWording) {
            if (errWording) {
              return done(errWording);
            }
            // save a type invoice
            agent.post('/api/typeinvoice')
              .send(typeFactMock)
              .expect(200)
              .end(function (errTypeinvoice, resTypeinvoice) {
                if (errTypeinvoice) {
                  return done(errTypeinvoice);
                }
                contrat.contratHeader.typeFacturation = { 'code': resTypeinvoice.body.code, 'category': { 'code': null }, 'isRequired': null, 'avoirNegatif': 0 };
                var tmpcomptableMask = ventMock.comptableMask;
                ventMock.facturationType = {
                  'code': resTypeinvoice.body.code,
                  'libelle': resTypeinvoice.body.libelle
                };
                agent.post('/api/ventilations')
                  .send(ventMock)
                  .expect(200)
                  .end(function (errVentilation, resVentilation) {
                    if (errVentilation) {
                      return done(errVentilation);
                    }
                    // save a contrat
                    agent.post('/api/contrats')
                      .send(basicContrat)
                      .expect(200)
                      .end(function (err, res) {
                        if (err) {
                          return done(err);
                        }
                        res.body.dateModify = 'date invalide';
                        agent.put('/api/contrats/' + res.body.code)
                          .send(res.body)
                          .expect(500)
                          .end(function (errUpdate, resUpdate) {
                            if (errUpdate) {
                              return done(errUpdate);
                            }
                            // Call the assertion callback
                            should.exist(resUpdate.body);
                            should.equal(resUpdate.statusCode, 500);
                            done();
                          });
                      });
                  });
              });
          });
      });
  });

  it('Create an invoice from Contrat', function(done) {
    agent.post('/api/auth/signin')
      .send(credentials)
      .expect(200)
      .end(function (signinErr, signinRes) {
        // Handle signin error
        if (signinErr) {
          return done(signinErr);
        }
        // save a wording
        agent.post('/api/wordings')
          .send(ventLabelMock)
          .expect(200)
          .end(function (errWording, resWording) {
            if (errWording) {
              return done(errWording);
            }
            // save a type invoice
            agent.post('/api/typeinvoice')
              .send(typeFactMock)
              .expect(200)
              .end(function (errTypeinvoice, resTypeinvoice) {
                if (errTypeinvoice) {
                  return done(errTypeinvoice);
                }
                contrat.contratHeader.typeFacturation = { 'code': resTypeinvoice.body.code, 'category': { 'code': null }, 'isRequired': null, 'avoirNegatif': 0 };
                var tmpcomptableMask = ventMock.comptableMask;
                ventMock.facturationType = {
                  'code': resTypeinvoice.body.code,
                  'libelle': resTypeinvoice.body.libelle
                };
                agent.post('/api/ventilations')
                  .send(ventMock)
                  .expect(200)
                  .end(function (errVentilation, resVentilation) {
                    if (errVentilation) {
                      return done(errVentilation);
                    }
                    // save a contrat
                    agent.post('/api/contrats')
                      .send(contrat)
                      .expect(200)
                      .end(function (errContrat, resContrat) {
                        if (errContrat) {
                          return done(errContrat);
                        }
                        contrat = resContrat.body;
                        agent.post('/api/contrats/facture/edit')
                          .send(contrat)
                          .expect(200)
                          .end(function (err, res) {
                            if (err) {
                              return done(err);
                            }
                            // Call the assertion callback
                            res.body.should.be.instanceof(Object);
                            should.exist(res.body);
                            done();
                          });
                      });
                  });
              });
          });
      });
  });

  it('La ligne du contrat n\'est pas valide ', function(done) {
    agent.post('/api/auth/signin')
      .send(credentials)
      .expect(200)
      .end(function (signinErr, signinRes) {
        // Handle signin error
        if (signinErr) {
          return done(signinErr);
        }
        // save a wording
        agent.post('/api/wordings')
          .send(ventLabelMock)
          .expect(200)
          .end(function (errWording, resWording) {
            if (errWording) {
              return done(errWording);
            }
            // save a type invoice
            agent.post('/api/typeinvoice')
              .send(typeFactMock)
              .expect(200)
              .end(function (errTypeinvoice, resTypeinvoice) {
                if (errTypeinvoice) {
                  return done(errTypeinvoice);
                }
                contrat.contratHeader.typeFacturation = { 'code': resTypeinvoice.body.code, 'category': { 'code': null }, 'isRequired': null, 'avoirNegatif': 0 };
                var tmpcomptableMask = ventMock.comptableMask;
                ventMock.facturationType = {
                  'code': resTypeinvoice.body.code,
                  'libelle': resTypeinvoice.body.libelle
                };
                agent.post('/api/ventilations')
                  .send(ventMock)
                  .expect(200)
                  .end(function (errVentilation, resVentilation) {
                    if (errVentilation) {
                      return done(errVentilation);
                    }
                    contrat.lignes = [];
                    // save a contrat
                    agent.post('/api/contrats')
                      .send(contrat)
                      .expect(200)
                      .end(function (errContrat, resContrat) {
                        if (errContrat) {
                          return done(errContrat);
                        }
                        contrat = resContrat.body;
                        agent.post('/api/contrats/facture/edit')
                          .send(contrat)
                          .expect(500)
                          .end(function (err, res) {
                            if (err) {
                              return done(err);
                            }
                            // Call the assertion callback
                            should.exist(res.body);
                            should.equal(res.body.code, '500.8');
                            done();
                          });
                      });
                  });
              });
          });
      });
  });

  it('Can\'t get non-existent contrat (should return 404)', function(done) {
    agent.post('/api/auth/signin')
      .send(credentials)
      .expect(200)
      .end(function (signinErr, signinRes) {
        // Handle signin error
        if (signinErr) {
          return done(signinErr);
        }
        agent.get('/api/contrats/0')
          .expect(404)
          .end(function (errGET, resGET) {
            if (errGET) {
              return done(errGET);
            }
            should.exist(resGET.body);
            should.equal(resGET.body.message, 'No pact with that identifier has been found');
            done();
          });
      });
  });

  it('Contrat ID is Numeric (should return 400)', function(done) {
    agent.post('/api/auth/signin')
      .send(credentials)
      .expect(200)
      .end(function (signinErr, signinRes) {
        // Handle signin error
        if (signinErr) {
          return done(signinErr);
        }
        var invalidID = 'TEST';
        agent.get('/api/contrats/' + invalidID)
          .expect(400)
          .end(function (errGET, resGET) {
            if (errGET) {
              return done(errGET);
            }
            should.exist(resGET.body);
            should.equal(resGET.body.message, 'Contrat ID is invalid');
            done();
          });
      });
  });


  it('Get single Contrat', function(done) {
    agent.post('/api/auth/signin')
      .send(credentials)
      .expect(200)
      .end(function (signinErr, signinRes) {
        // Handle signin error
        if (signinErr) {
          return done(signinErr);
        }
        // save a wording
        agent.post('/api/wordings')
          .send(ventLabelMock)
          .expect(200)
          .end(function (errWording, resWording) {
            if (errWording) {
              return done(errWording);
            }
            // save a type invoice
            agent.post('/api/typeinvoice')
              .send(typeFactMock)
              .expect(200)
              .end(function (errTypeinvoice, resTypeinvoice) {
                if (errTypeinvoice) {
                  return done(errTypeinvoice);
                }
                contrat.contratHeader.typeFacturation = { 'code': resTypeinvoice.body.code, 'category': { 'code': null }, 'isRequired': null, 'avoirNegatif': 0 };
                var tmpcomptableMask = ventMock.comptableMask;
                ventMock.facturationType = {
                  'code': resTypeinvoice.body.code,
                  'libelle': resTypeinvoice.body.libelle
                };
                agent.post('/api/ventilations')
                  .send(ventMock)
                  .expect(200)
                  .end(function (errVentilation, resVentilation) {
                    if (errVentilation) {
                      return done(errVentilation);
                    }
                    // save a contrat
                    agent.post('/api/contrats')
                      .send(contrat)
                      .expect(200)
                      .end(function (errContrat, resContrat) {
                        if (errContrat) {
                          return done(errContrat);
                        }
                        agent.get('/api/contrats/' + resContrat.body.code)
                          .expect(200)
                          .end(function (errGET, resGET) {
                            if (errGET) {
                              return done(errGET);
                            }
                            should.exist(resGET.body);
                            should.equal(resGET.body.userCode.trim(), 'usernamecontrat');
                            done();
                          });
                      });
                  });
              });
          });
      });
  });

  it('should  be able to get list of Contrats ', function (done) {

    agent.post('/api/auth/signin')
      .send(credentials)
      .expect(200)
      .end(function (signinErr, signinRes) {
        // Handle signin error
        if (signinErr) {
          return done(signinErr);
        }

        agent.get('/api/contrats')
          .expect(200)
          .end(function (contratErr, contratRes) {
            if (contratErr) {
              return done(contratErr);
            }
            // Call the assertion callback
            contratRes.body.should.be.instanceof(Array);
            done();
          });

      });
  });

  afterEach(function (done) {
     // delete lines
    msSQLClient.insertUpdate('DELETE FROM dvContratLine ', function() {});
    // delete ventillation
    msSQLClient.insertUpdate('DELETE FROM dvVentilation ', function() {});
    // delete type invoice
    msSQLClient.insertUpdate('DELETE FROM dvTypeInvoice', function() {});
    // delete wording
    msSQLClient.insertUpdate('DELETE FROM dvWording ', function() {});
    // delete contrat
    msSQLClient.insertUpdate('DELETE FROM dvContrat ', function() {});
    User.remove().exec(done);
  });
});
