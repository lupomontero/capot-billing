/*eslint no-var:0, prefer-arrow-callback: 0 */
'use strict';


var Product = require('./product');


module.exports = function (app, configs) {

  var products = {};


  products.find = function (id) {

    var config = configs.find(function (model) {

      return model.id === id;
    });

    if (!config) {
      return null;
    }

    return Product(config);
  };


  products.findAll = function () {

    return configs.map(function (config) {

      return Product(config);
    });
  };


  return products;
};

