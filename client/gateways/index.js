/*eslint no-var:0, prefer-arrow-callback: 0 */
'use strict';


var Promise = require('promise');
var Tco = require('./tco');


var internals = {};


internals.gateways = {
  tco: Tco
};


internals.fetch = function (app) {

  return app.request('GET', '/_gateways').then();
};


internals.parse = function (app, options) {

  return internals.gateways[options.id](app, options);
};


module.exports = function (app) {

  var cache = null;
  var gateways = {};


  gateways.find = function (id) {

    return gateways.findAll().then(function (items) {

      return items[id];
    });
  };


  gateways.findAll = function () {

    if (cache) {
      return new Promise(function (resolve, reject) {

        return resolve(cache);
      });
    }

    return app.request('GET', '/_gateways').then(function (array) {

      cache = array.reduce(function (memo, item) {

        memo[item.id] = internals.parse(app, item);
        return memo;
      }, {});

      return cache;
    });
  };


  gateways.pay = function (method, invoice, args) {

    return gateways.find(method).then(function (gateway) {

      return gateway.pay(invoice, args);
    });
  };


  return gateways;
};
