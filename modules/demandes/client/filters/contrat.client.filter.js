(function () {
  'use strict';

  /**
   * test if two date have same day, month and year
   * @param  {date} date1
   * @param  {date} date2
   * @return {boolean}
   */
  var compareDate = function(date1, date2) {
    // get day month and year of date 1
    var dd1 = date1.getDate();
    var mm1 = date1.getMonth();
    var yyyy1 = date1.getFullYear();

    // get day month and year of date 2
    var dd2 = date2.getDate();
    var mm2 = date2.getMonth();
    var yyyy2 = date2.getFullYear();

    return dd1 === dd2 && mm1 === mm2 && yyyy1 === yyyy2;
  };

  /**
   * Convert String to date
   * @param  {String} chain string to convert
   * @return {Date} date
   */
  var convertStringToDate = function(chain) {
    var from = chain.trim().split('/');
    var mydate = new Date(from[2], from[1] - 1, from[0]);
    return mydate;
  };


  angular.module('contrats.filters')
    .filter('contratListFilter', function () {
      return function(contrats, filtreModel, Authentication) {
        return contrats.filter(function(el) {
          // do uppercase firstname and lastname of customer
          var nomClient = el.firstNameCustomer ? el.firstNameCustomer.trim().toUpperCase() : null;
          var prenomClient = el.lastNameCustomer ? el.lastNameCustomer.trim().toUpperCase() : null;
          var contratCode = el.contratCode ? el.contratCode.trim().toUpperCase() : null;

          var clientNameFiltre = filtreModel.customerName ? filtreModel.customerName.toUpperCase() : '';
          //  convert to date Date
          if (filtreModel.contratDateCreated && typeof(filtreModel.contratDateCreated) === 'string') {
            filtreModel.contratDateCreated = convertStringToDate(filtreModel.contratDateCreated);
          }

          // get username of current user
          var username = Authentication.user.username.trim();

          return (!filtreModel.contratNumber || (contratCode && contratCode.indexOf(filtreModel.contratNumber.toUpperCase()) > -1)) &&
            (!clientNameFiltre || (prenomClient.indexOf(clientNameFiltre) > -1) || (nomClient.indexOf(clientNameFiltre) > -1)) &&
            (!filtreModel.customerCode || ('' + el.customerCode).indexOf(filtreModel.customerCode) > -1) &&
            (!filtreModel.contratDateCreated || compareDate(new Date(filtreModel.contratDateCreated), new Date(el.createdDate))) &&
            (!filtreModel.contratType || parseInt(filtreModel.contratType, 10) === el.stateContrat) &&
            (filtreModel.seeAll === true || username.toUpperCase() === el.userCode.trim().toUpperCase());
        });
      };
    });
}());

