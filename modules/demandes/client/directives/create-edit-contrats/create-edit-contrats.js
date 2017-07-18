(function () {
  'use strict';

  angular.module('contrats.directives')
    .directive('createEditContrat', createEditContrat);

  createEditContrat.$inject = ['$state', '$stateParams', 'ComptesService', 'Notification', 'ClientFactureService', 'ClientModel', '$uibModal', 'cfpLoadingBar', 'UtilsService', '$filter', 'TypeFacturationService', 'EtablissementModel', 'ContratsService', 'CompteclientService', 'VehiculesService', 'FacturesService', 'LigneModel', 'MnemoniquesService', 'PaymentDeadlineService', 'Contrat'];
  /**
   * Create/Edit Contrat modal
   * @param  {Object} $state
   */
  function createEditContrat($state, $stateParams, ComptesService, Notification, ClientFactureService, ClientModel, $uibModal, cfpLoadingBar, UtilsService, $filter, TypeFacturationService, EtablissementModel, ContratsService, CompteclientService, VehiculesService, FacturesService, Ligne, MnemoniquesService, PaymentDeadlineService, Contrat) {
    var directive = {
      restrict: 'EA',
      transclude: false,
      templateUrl: 'modules/contrats/client/directives/create-edit-contrats/create-edit-contrats.html',
      scope: {
        contrat: '=',
        etablissements: '=',
        periodicity: '=',
        tvas: '=',
        modereglement: '=',
        paymentdead: '='
      },
      link: link
    };

    return directive;
    /**
     * link function
     * @param  {Object} scope
     * @return {Object} scope
     */
    function link(scope) {
      // Init datas (linkPreformatted permet de selectionner par défault un radio)
      scope.linkPreformatted = (scope.contrat.lignes && scope.contrat.lignes.length && scope.contrat.lignes[0] && scope.contrat.lignes[0].linkPreformattedComment) ? 'comment' : 'libelle';
      scope.typeFacturations = [];
      scope.facturesContrat = [];
      scope.listMnemoniques = [];
      scope.comptaAccounts = [];
      scope.analyticAccounts = [];
      scope.clients = [];
      scope.scherchClient = {
        code_client: '',
        name: '',
        prenom: '',
        session: '',
        type: 'code',
        results: []
      };
      scope.edit = false;
      scope.contrat.kind = 'contrat';
      scope.newLigne = new Ligne(scope.contrat.lignes[0]);
      scope.regextest = true;

        /**
         * testRegex
         * Cette fonction test si preformed data match le pattern
         */
      scope.testRegex = function () {
        scope.regextest = (scope.newLigne.preformattedData.length === 0) || (/du (([0-9]){2}\/([0-9]){2}\/([0-9]){4} au ([0-9]){2}\/([0-9]){2}\/([0-9]){4})/.test(scope.newLigne.preformattedData) && (scope.newLigne.preformattedData.length > 0));
      };

     // set default value for pagination References Entêtes

      /**
       * initPeriod
       * @description : Initialize the periode of cntract, select by default periodicity monthly
       */
      function initPeriod() {
        for (var i = 0; i < scope.periodicity.length; i++) {
          if (scope.periodicity[i].code === 5 && !scope.contrat.contratParameters.periodicity)
            scope.contrat.contratParameters.periodicity = '' + scope.periodicity[i].code;
        }
        var periodOfzero = scope.periodicity[0] ? '' + scope.periodicity[0].code : '0';
        scope.contrat.contratParameters.periodicity = scope.contrat.contratParameters.periodicity ? ('' + scope.contrat.contratParameters.periodicity) : periodOfzero;
      }

      /**
       * initdeadLine
       * @description : Initialize the initdeadLine of cntract, select by defaul the first deadLine
       */
      function initdeadLine() {
        scope.contrat.contratParameters.deadLine = scope.contrat.contratParameters.deadLine || (scope.paymentdead[0] ? '' + scope.paymentdead[0].code : '0');
        for (var i = 0; i < scope.paymentdead.length; i++) {
          if (scope.paymentdead[i].code === 2)
            scope.contrat.contratParameters.deadLine = '' + scope.paymentdead[i].code;
        }
      }

      function startsWith(expected) {
        var continu = true;
        var result = null;
        angular.forEach(scope.modereglement, function(value) {
          var lowerStr = (value.description ? value.description.trim() : '').toLowerCase();
          if (continu && lowerStr.indexOf(expected.toLowerCase()) === 0) {
            continu = false;
            result = value;
          }
        });
        return result;
      }

      /**
       * searchCheque
       * @description recherche item contenant le libellé 'chèque'
       */
      function searchCheque(token) {
        var result = null;
        var continu = true;
        angular.forEach(scope.modereglement, function(value, key) {
          if (continu && value.description && value.description.trim() === token) {
            continu = false;
            result = value;
          }
        });
        return result;
      }

      function getDefaultModeReglement() {
        // Si 'chèque' existe
        var resultat = searchCheque('Chèque');
        if (!resultat) {
          // Si 'Chèque de banque' existe
          resultat = searchCheque('Chèque de banque');
          if (!resultat) {
            // recupere la première description commençant par 'chèque'
            resultat = startsWith('chèque');
          }
        }
        return resultat;
      }

      /**
       * Retourne le mode de reglement par default
       * @param {Integer} index
       * @return {Object}
       */
      function getModeReglement(index) {
        return $filter('filter')(scope.modereglement, { code: index })[0] || {};
      }

      /**
       * initdeadLine
       * @description : Initialize the payment mode of cntract, select by default paymentMode
       */
      function initPaymentMode() {
        // Par default le mode bancaire est selectionné
        scope.contrat.contratParameters.paymentMode = scope.contrat.contratParameters.paymentMode.code ? getModeReglement(scope.contrat.contratParameters.paymentMode.code) : (getDefaultModeReglement() || scope.modereglement[0]);
      }
      initPeriod();
      initdeadLine();
      initPaymentMode();

      scope.currentPageEntete = 1;
      scope.perPageEntete = 6;
      scope.maxSizeEntete = 3;
      scope.perPage = 10;
      /**
       * Initialize facture data
       * @return {Object} scope.contrat / scope.newLigne
       */
      function initDataTypeFacturation () {
        for (var j = 0; j < scope.tvas.length; j++) {
          if (scope.tvas[j].codeTVA.toString() === scope.newLigne.tva.codeTVA.toString()) {
            scope.newLigne.tva = scope.tvas[j];
            break;
          }
        }
        for (var i = 0; i < scope.typeFacturations.length; i++) {
          if (scope.typeFacturations[i].code === scope.contrat.contratHeader.typeFacturation.code) {
            scope.contrat.contratHeader.typeFacturation = scope.typeFacturations[i];
            break;
          }

        }
      }
      initDataTypeFacturation();
      scope.facturesContrat = scope.contrat.factures;
      // open invoice collapse if contrat have facture
      scope.isIn = (scope.facturesContrat.length > 0) ? 'in' : '';

      /**
       * set selectedFacture
       * @param facture
         */
      scope.setCurrentFacture = function(facture) {
        scope.selectedFacture = facture;
      };
      /**
       * Open selected Facture
       * @param factureId
         */
      scope.viewAFacture = function(factureId) {
        $state.go('factures.view', { factureId: factureId });
      };

      /**
       * Initialize tye facturation
       */
      function initTypeFacturation () {
        TypeFacturationService.query().$promise.then(function(data) {
          var datafiltred = $filter('filter')(data, { category: { code: 2 } });
          scope.typeFacturations = angular.copy(datafiltred);
        });
      }
      initTypeFacturation();
      scope.listFactures = [];
      /**
       * initialize 'etablissement' on current contrat
       * @return {Object} scope.contrat.contratHeader.establishment
       */
      scope.loadEtablissement = function() {
        if (scope.etablissements.length === 1 && scope.etablissements[0].models.length === 1) {
          scope.contrat.contratHeader.establishment.establishmentName = scope.etablissements[0].nomEtablissement;
          scope.contrat.contratHeader.establishment.establishmentCode = scope.etablissements[0].codeEtablissement;
          scope.contrat.contratHeader.establishment.modele = scope.etablissements[0].models[0];
        }
        angular.forEach(scope.etablissements, function(value) {
          value.selected = scope.contrat.contratHeader.establishment.codeEtablissement === value.codeEtablissement;
          angular.forEach(value.models, function(item) {
            item.selected = item.code === scope.contrat.contratHeader.establishment.modele.code && scope.contrat.contratHeader.establishment.codeEtablissement === value.codeEtablissement;
          });
        });
      };
      scope.loadEtablissement();

        /**
         * setReadOnlyValues
         * Cette fonction permet griser les champs si le contrat est cloture
         */
      scope.setReadOnlyValues = function() {
        if (scope.contrat.contratHeader.stateContrat === 1) {
          scope.valueReadOnly = true;
        } else {
          scope.valueReadOnly = false;
        }
      };
      /**
       * Set Etablissment model on Contrat
       * @param etablissement
       * @param modele
         */
      scope.changeSateEtablissement = function (etablissement, modele) {
        if (modele.selected) {
          // set selected etablissement on facture
          etablissement.modele = modele;
          scope.contrat.contratHeader.establishment = new EtablissementModel(etablissement);
        }
        // unselect all other marque
        angular.forEach(scope.etablissements, function(value) {
          value.selected = modele.selected && etablissement.codeEtablissement === value.codeEtablissement;
          angular.forEach(value.models, function(item) {
            item.selected = item.code === modele.code && etablissement.codeEtablissement === value.codeEtablissement;
          });
        });

      };
      // Give default value to contrat state
      scope.contrat.contratHeader.stateContrat = scope.contrat.contratHeader.stateContrat || 0;
      scope.setReadOnlyValues();
      /**
       * this function encapsule cloture contrat process
       */
      scope.clotureContratProcess = function(oldstat, value) {
        $uibModal.open({
          templateUrl: value ? 'modules/contrats/client/views/modal.confirm.cloture.contrat.client.html' : 'modules/contrats/client/views/modal.confirm.reopen.contrat.client.html',
          controller: function($uibModalInstance, $scope) {
            $scope.confirmclotureContratcanceled = function () {
              scope.contrat.contratHeader.stateContrat = oldstat;
              $uibModalInstance.dismiss();
            };
            $scope.confirmclotureContratYes = function () {
              scope.contrat.contratHeader.stateContrat = value;
              ContratsService.save(scope.contrat)
                .then(onClotureOrReopenSuccess)
                .catch(onClotureError);
              $uibModalInstance.dismiss();

            };
          }
        });
      };
      /**
       * Change Contrat Status
       * @param value
       */
      scope.changeStatutContrat = function(value) {
        var oldstat = scope.contrat.contratHeader.stateContrat;
        // 1 is to cloture contrat
        scope.clotureContratProcess(oldstat, value);

      };

      /**
       * Set Models Choice
       * @param {Object} event
       * @param {response} response
       */
      function setModelsChoice(event, response) {
        if (response && response.vehicule) {
          scope.contrat.contratParameters.vehicule = response.vehicule;
          scope.contrat.contratHeader.client.complementCommande.vehiculeModel = angular.copy(response.vehicule.vehiculeModel);
          scope.contrat.contratHeader.client.complementCommande.chassis = angular.copy(response.vehicule.chassis);
          scope.contrat.contratHeader.client.complementCommande.numImmatriculation = angular.copy(response.vehicule.numImmatriculation);
          scope.contrat.contratHeader.client.complementCommande.esVO = (response.vehicule.esVO === 'VO') ? 1 : 0;
          scope.contrat.contratHeader.client.complementCommande.esCourtoisie = (response.vehicule.courtoisie === 'Cortoisie') ? 1 : 0;
          scope.contrat.contratHeader.client.complementCommande.carOwner = angular.copy(response.vehicule.carOwner ? response.vehicule.carOwner.trim() : '');
          scope.contrat.contratHeader.client.complementCommande.carMark = angular.copy(response.vehicule.carMark ? response.vehicule.carMark.trim() : '');
        } else {
          scope.contrat.contratParameters.vehicule = response.vehicule;
          scope.contrat.contratHeader.client.complementCommande.vehiculeModel = '';
          scope.contrat.contratHeader.client.complementCommande.chassis = '';
          scope.contrat.contratHeader.client.complementCommande.numImmatriculation = '';
          scope.contrat.contratHeader.client.complementCommande.esVO = 0;
          scope.contrat.contratHeader.client.complementCommande.esCourtoisie = 0;
          scope.contrat.contratHeader.client.complementCommande.carOwner = '';
          scope.contrat.contratHeader.client.complementCommande.carMark = '';
        }
      }

      /*
       * set entete reference for vehicule choice
       */
      scope.$on('modeles-vehicules', setModelsChoice);

      /**
       * Popup for choice vehicule
       * @param  {Object} entete
       * @return {Object}
       */
      scope.choiceVehiculeCaracter = function (entete) {
        if (scope.contrat.contratHeader.client.codeClient && scope.contrat.contratHeader.client.codeClient !== '') {
          $uibModal.open({
            templateUrl: 'modules/contrats/client/views/vehicule.contrat.caracter.choice.client.html',
            scope: scope,
            controller: 'vehiculeModalController',
            resolve: {
              vehicule: function () {
                return entete;
              },
              complementCommande: function () {
                scope.contrat.contratHeader.client.complementCommande.carCode = scope.contrat.contratParameters.vehicule ? scope.contrat.contratParameters.vehicule.code : null;
                return scope.contrat.contratHeader.client.complementCommande;
              },
              listVehicules: function () {
                return VehiculesService.query({ code: scope.contrat.contratHeader.client.codeClient }).$promise;
              }
            },
            size: 'lg'
          });
        } else {
          Notification.error({
            message: $filter('translate')('facture.referenceEntete.vehiculesChoice.clientError.libelle'),
            title: '<i class="glyphicon glyphicon-remove"></i>' + $filter('translate')('facture.referenceEntete.vehiculesChoice.clientError.title'),
            delay: 6000
          });
        }
      };

      /**
       * Founded client
       * @param  {Object} client
       * @return {Object } scope.newfacture.client
       */
      scope.foundedClient = function (client) {
        client.mobile = client.mobile ? client.mobile.trim() || client.mobilePro : '...';
        scope.contrat.contratHeader.client = new ClientModel(client);
        // Clear search
        $('#id-nom-client').val('');
        // focus search input after founded client
        $('#id-nom-client').focus();
        scope.visualizeActivity();
      };

      scope.loadClients = function(event) {
        // startSearch identify when we start to search
        // 1 - Code
        // 2 - Nom client
        if (event.keyCode === 8) {
          return false;
        }

        var startSearch = 2;
        // Use to see if it's code or name is used to search
        scope.scherchClient.searchCode = 1;
        // Get the string filled by user and check if it's a integer
        // if integer we search by code else we search by name.
        if (isNaN(parseInt(scope.scherchClient.name, 10))) {
          startSearch = 3;
          scope.scherchClient.searchCode = 0;
        }
        if (scope.scherchClient.name.length === startSearch) {
          // the type of client here must be 'CLIENT' and not 'CESSION'
          var type = 0;
          ClientFactureService.list(generateQuery(type)).then(function (data) {
            scope.clients = angular.copy(data);
          }, function () {
            scope.clients = [];
          });
        }
      };
      /**
       * Generate to search client
       * @param  {String} type (client - cession)
       * @return {String} Query string
       */
      function generateQuery (type) {
        var isCode = isNaN(scope.scherchClient.name);
        var shearchText = isCode ? ('?nom=' + UtilsService.formatNameforApellidoSearch(UtilsService.accentsReplace(scope.scherchClient.name)).toUpperCase() || '') : '';
        shearchText += !isCode ? ('?codeClient=' + scope.scherchClient.name || '') : '';
        shearchText += '&typeClient=' + type || '';
        return shearchText;
      }

      /**
       * save
       * @returns {*}
       */
      scope.save = function () {
        selectRadio();
        // Recalculer les donnees preformattées
        setPreformatedData();
        scope.contrat.lignes[0] = scope.newLigne;
        if (scope.contrat.contratParameters.vehicule && scope.contrat.contratParameters.vehicule.code) {
          scope.contrat.contratHeader.client.complementCommande.vehiculeModel = scope.contrat.contratHeader.client.complementCommande.vehiculeModel || angular.copy(scope.contrat.contratParameters.vehicule.vehiculeModel);
          scope.contrat.contratHeader.client.complementCommande.chassis = scope.contrat.contratHeader.client.complementCommande.chassis || angular.copy(scope.contrat.contratParameters.vehicule.chassis);
          scope.contrat.contratHeader.client.complementCommande.numImmatriculation = scope.contrat.contratHeader.client.complementCommande.numImmatriculation || angular.copy(scope.contrat.contratParameters.vehicule.numImmatriculation);
        }


        cfpLoadingBar.start();
        if (!scope.contrat.contratHeader.client || !scope.contrat.contratHeader.client.codeClient) {
          Notification.error({
            message: $filter('translate')('contrat.messages.saveClientError.libelle'),
            title: '<i class="glyphicon glyphicon-remove"></i> ' + $filter('translate')('contrat.messages.saveClientError.title'),
            delay: 6000
          });
        } else if (!scope.contrat.contratHeader.establishment || !scope.contrat.contratHeader.establishment.codeEtablissement || !scope.contrat.contratHeader.establishment.modele.code) {
          Notification.error({
            message: $filter('translate')('contrat.messages.saveEtablishmentError.libelle'),
            title: '<i class="glyphicon glyphicon-remove"></i> ' + $filter('translate')('contrat.messages.saveEtablishmentError.title'),
            delay: 6000
          });
        } else if (!scope.contrat.contratHeader.typeFacturation || !scope.contrat.contratHeader.typeFacturation.code) {
          Notification.error({
            message: $filter('translate')('contrat.messages.saveTypeInvoiceError.libelle'),
            title: '<i class="glyphicon glyphicon-remove"></i> ' + $filter('translate')('contrat.messages.saveTypeInvoiceError.title'),
            delay: 6000
          });
        } else if (!scope.regextest) {
          Notification.error({
            message: $filter('translate')('contrat.messages.saveRegexError.libelle'),
            title: '<i class="glyphicon glyphicon-remove"></i> ' + $filter('translate')('contrat.messages.saveRegexError.title'),
            delay: 6000
          });
        } else {
          ContratsService.save(scope.contrat)
            .then(onSaveSuccess)
            .catch(onSaveError);
        }
      };

      /**
         * onClotureError
       */
      function onClotureError() {
        Notification.error({
          message: $filter('translate')('contrat.messages.clotureError.libelle'),
          title: '<i class="glyphicon glyphicon-remove"></i> ' + $filter('translate')('contrat.messages.clotureError.title'),
          delay: 6000
        });

      }

      /**
       * onClotureOrReopenSuccess
       * @param response
         */
      function onClotureOrReopenSuccess(response) {
        if (response && response.code === '200.4') {
          Notification.success({
            message: $filter('translate')('contrat.messages.deleteSucces.libelle'),
            title: '<i class="glyphicon glyphicon-remove"></i> ' + $filter('translate')('contrat.messages.deleteSucces.title'),
            delay: 6000
          });
          $state.go('contrats.list');
        } else {
          $state.go('contrats.view', { contratId: response.code }, { reload: true });
          if (response.contratHeader.stateContrat === 1) {
            Notification.success({
              message: $filter('translate')('contrat.messages.clotureSucces.libelle'),
              title: '<i class="glyphicon glyphicon-remove"></i> ' + $filter('translate')('contrat.messages.clotureSucces.title'),
              delay: 6000
            });
          } else {
            Notification.success({
              message: $filter('translate')('contrat.messages.reopenSucces.libelle'),
              title: '<i class="glyphicon glyphicon-remove"></i> ' + $filter('translate')('contrat.messages.reopenSucces.title'),
              delay: 6000
            });
          }

        }
        cfpLoadingBar.complete();
      }

      /**
       * onSaveSuccess description
       * @param  {Object} response
       * @return {Object} Notification
       */
      function onSaveSuccess(response) {
        ContratsService.get({ contratId: response.code }).$promise.then(function(data) {
          scope.contrat = new Contrat(data);
          scope.newLigne = new Ligne(scope.contrat.lignes[0]);
          initPeriod();
          initdeadLine();
          initPaymentMode();
          if (scope.edit) {
            scope.editNextFacture();
          } else {
            $state.go('contrats.view', { contratId: response.code }, { reload: false });
            Notification.success({
              message: $filter('translate')('contrat.messages.saveSucces.libelle'),
              title: '<i class="glyphicon glyphicon-remove"></i> ' + $filter('translate')('contrat.messages.saveSucces.title'),
              delay: 6000
            });
            cfpLoadingBar.complete();
          }
        });
      }

      /**
       * on Save Error
       * @param  {Object} err
       * @return {Object} Notification
       */
      function onSaveError(err) {
        if (err.data && err.data.code === '500.5') {
          Notification.error({
            message: $filter('translate')('contrat.messages.saveTypeInvoiceError.libelle'),
            title: '<i class="glyphicon glyphicon-remove"></i> ' + $filter('translate')('contrat.messages.saveTypeInvoiceError.title'),
            delay: 6000
          });
        } else {
          Notification.error({
            message: $filter('translate')('contrat.messages.saveError.libelle'),
            title: '<i class="glyphicon glyphicon-remove"></i> ' + $filter('translate')('contrat.messages.saveError.title'),
            delay: 6000
          });
        }
      }

      /**
         * showSearchPanel
       */
      scope.showSearchPanel = function () {
        $uibModal.open({
          templateUrl: 'modules/factures/client/views/search-client-facture.client.modal.html',
          scope: scope,
          controller: 'SearchFactureModalController',
          resolve: {
            type: function () {
              return scope.scherchClient.type;
            },
            idContrat: function () {
              return undefined;
            }
          },
          size: 'lg'
        });
      };

      /**
       * Open activity modal
       */
      scope.visualizeActivity = function () {
        CompteclientService.getClientAccounts(scope.contrat.contratHeader.client).then(function(data) {
          scope.activityAccountDatas = data;
          if (scope.isClientValide()) {
            $uibModal.open({
              templateUrl: 'modules/factures/client/directives/compte-client-activite/compte-client-activite.html',
              scope: scope,
              controller: 'activitymodalController',
              resolve: {
                kind: function () {
                  return 'contrat';
                }
              },
              size: 'md'
            });
          }
        });
      };


      /**
       * Open activity modal
       */
      scope.isClientValide = function () {
        if (scope.activityAccountDatas.div.length < 1 || !scope.activityAccountDatas.div[0].account) {
          Notification.error({
            message: $filter('translate')('contrat.client.messages.clientInvalid.libelle'),
            title: '<i class="glyphicon glyphicon-remove"></i> ' + $filter('translate')('contrat.client.messages.clientInvalid.title'),
            delay: 6000
          });
          return false;
        }
        return true;

      };
      /**
       * Get list mnemoniques by type invoice -Filter Mnemonics by Invoice Type
       * @param  {Integer} code type invoice
       * @return {Object}  Mnemonique
       */
      function getMnemoniquesByTypeInvoice(codeTypeInvoice) {
        return MnemoniquesService.query().$promise.then(function(data) {
          var mnemos = data;
          scope.listMnemoniques = $filter('filter')(mnemos, { typeFacturation: { code: codeTypeInvoice } });
        });
      }

      scope.monCompteur = 0;
      /**
       * load account by type
       * @param  {integer} account Code
       * @param  {String}  account type (analytics, comptable)
       * @return {Object array}  account
       */
      scope.loadAccount = function (code, type) {
        if (code && code.toString().length === 1) {
          getMnemoniquesByTypeInvoice(scope.contrat.contratHeader.typeFacturation.code);
          getComptableAccounts(code, type);
        }
        if (code) {
          scope.monCompteur = code.toString().length;
        } else {
          scope.monCompteur = 0;
        }
      };

      /**
       * Select compte Compta on facture line
       * @param  {Object} compte
       * @param  {Object} nemonik
       * @return {Object} scope.newLigne/ scope.shownavigationTab
       */
      scope.selectedCompteComptaOnLineFacture = function (compte, nemonik) {
        if (!nemonik) {
          scope.newLigne.codeComptable = compte.codeCta.trim();
        } else {
          scope.newLigne = new Ligne(nemonik);
          setTypeFacturationFromMnemonique(nemonik);
        }
        scope.shownavigationTab = -1;
      };

      /**
       * Fill type facture when it's empty & we choose mnemonique on compte comptable
       * @param {Object} mnemonique
       * @return {Object} scope.newFacture update typeFacturation
       */
      function setTypeFacturationFromMnemonique (mnemonique) {
        if (!scope.contrat.contratHeader.typeFacturation.code) {
          var typeFact = $filter('filter')(scope.typeFacturetions, { code: mnemonique.typeFacturation.code });
          scope.contrat.contratHeader.typeFacturation = angular.copy(typeFact[0]);
        }
      }


      /**
       * get Comptable Accounts
       * @param  {integer} accountCode
       * @param  {String}  type        account type (analytics, comptable)
       * @return {Object}  scope
       */
      function getComptableAccounts(accountCode, type) {
        return ComptesService.query({ typeCompte: type, code: accountCode }).$promise.then(function(data) {
          if (type === 'analytic') {
            scope.analyticAccounts = angular.copy(data);
          } else {
            scope.comptaAccounts = angular.copy(data);
          }
        });
      }

      /**
       * Select compte Compta on  line
       * @param  {Object} compte
       * @param  {Object} nemonik
       * @return {Object} scope.newLigne/ scope.shownavigationTab
       */
      scope.selectedCompteComptaOnLine = function (compte, nemonik) {
        if (!nemonik) {
          scope.newLigne.codeComptable = compte.codeCta.trim();
        } else {
          scope.newLigne = new Ligne(nemonik);
        }
      };

      /**
       * actionEditNF
       */
      scope.actionEditNF = function () {
        scope.edit = true;
        UtilsService.convertDate(scope.contrat.contratParameters.startDateForNextPeriod, function(date) {
          if (scope.contrat.contratParameters.startDateForNextPeriod && (new Date().getTime() < date.getTime())) {
            Notification.error({
              message: $filter('translate')('contrat.messages.echeanceNotReach.libelle'),
              title: '<i class="glyphicon glyphicon-remove"></i> ' + $filter('translate')('contrat.messages.echeanceNotReach.title'),
              delay: 6000
            });

          } else {
            scope.save();
          }
        });

      };


      /**
       * editNextFacture
       */
      scope.editNextFacture = function () {
        scope.edit = false;
        ContratsService.editNextInvoice(scope.contrat)
          .then(succesEditNextFacture)
          .catch(errorEditNextFacture);
      };

      /**
       * succesEditNextFacture
       * @param  {Object} err
       * @return {Object} Notification
       */
      function succesEditNextFacture(response) {
        cfpLoadingBar.complete();
        $state.go('factures.view', { factureId: response.invCode }, { reload: true });
      }

      /**
       * errorEditNextFacture
       * @param  {Object} err
       * @return {Object} Notification
       */
      function errorEditNextFacture(err) {
        if (err.data && err.data.code === '500.5') {
          Notification.error({
            message: $filter('translate')('contrat.messages.saveTypeInvoiceError.libelle'),
            title: '<i class="glyphicon glyphicon-remove"></i> ' + $filter('translate')('contrat.messages.saveTypeInvoiceError.title'),
            delay: 6000
          });
        } else {
          cfpLoadingBar.complete();
          Notification.error({
            message: $filter('translate')(err.data.message.libelle),
            title: '<i class="glyphicon glyphicon-remove"></i> ' + $filter('translate')(err.data.message.titre),
            delay: 6000
          });
        }
      }


      /**
       * setPreformatedData
       * Regle sur le cahier
       * La première date est la date de début de période = Date de début + (Périodicité * nombre d’échéances).
       * La seconde date est la date de fin de la période = Date de début + (périodicité * nombre d’échéances + 1).
       * Regle applique apres analyse
       * La première date est la date de début de période = Date de début + (Périodicité * nombre facture editee).
       * La seconde date est la date de fin de la période = Date de début + (périodicité * (nombre facture editee + 1)).

       */
      function setPreformatedData() {
        if (scope.contrat.contratParameters.startDate && scope.contrat.contratParameters.periodicity) {
          UtilsService.convertDate(scope.contrat.contratParameters.startDate, function(startDate) {
            var debut = angular.copy(startDate);
            var fin = angular.copy(startDate);
            debut.setDate(debut.getDate() + (scope.periodicity[scope.contrat.contratParameters.periodicity - 1].value * (parseInt(scope.contrat.contratParameters.numberInvoiceEdited, 10))));
            fin.setDate(fin.getDate() + (scope.periodicity[scope.contrat.contratParameters.periodicity - 1].value * (parseInt(scope.contrat.contratParameters.numberInvoiceEdited, 10) + 1)));
            debut = UtilsService.formatDateGiven(debut);
            fin = UtilsService.formatDateGiven(fin);
            scope.newLigne.preformattedData = ' du ' + debut + ' au ' + fin;
          });

        }
      }
      setPreformatedData();


      scope.parseNumberInvoiceEdited = function() {
        return parseInt(scope.contrat.contratParameters.numberInvoiceEdited, 10);
      };

      /**
       * selectRadio
       * @description setter linkPreformattedLibelle et linkPreformattedComment en fonction du radio selectionné
       */
      function selectRadio() {
        if (scope.linkPreformatted === 'libelle') {
          scope.newLigne.linkPreformattedLibelle = 1;
          scope.newLigne.linkPreformattedComment = 0;
        } else {
          scope.newLigne.linkPreformattedLibelle = 0;
          scope.newLigne.linkPreformattedComment = 1;
        }
      }

      /**
       * selectTvaByInvoiceType
       * @description allow to select default tva of invoice type selected
       */
      scope.selectTvaByInvoiceType = function () {
        if (scope.contrat.contratHeader.typeFacturation && scope.contrat.contratHeader.typeFacturation.tva) {
          scope.newLigne.tva = $filter('filter')(scope.tvas, { codeTVA: scope.contrat.contratHeader.typeFacturation.tva.codeTVA })[0];
          if (!scope.newLigne.tva.codeTVA) {
            scope.newLigne.tva = $filter('filter')(scope.tvas, { codeTVA: scope.contrat.contratHeader.typeFacturation.tva.codeTVA })[0];
          }
        }
      };
      scope.selectTvaByInvoiceType();
    }
  }
}());
