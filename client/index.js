/*eslint no-var:0, prefer-arrow-callback: 0 */
'use strict';


require('jquery.payment');


var Cart = require('./cart');
var Products = require('./products');
var Invoices = require('./invoices');
var Gateways = require('./gateways');


module.exports = function (app, options) {

  console.log(options);
  options = options || {};
  options.products = options.products || [];

  return {
    cart: Cart(app),
    gateways: Gateways(app),
    products: Products(app, options.products),
    invoices: Invoices(app)
  };
};

