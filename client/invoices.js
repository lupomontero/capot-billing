/*eslint no-var:0, prefer-arrow-callback: 0 */
'use strict';


module.exports = function (app) {

  var invoices = {};


  invoices.add = function () {

    console.log(arguments);
  };


  return invoices;
};

