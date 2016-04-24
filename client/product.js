/*eslint no-var:0, prefer-arrow-callback: 0 */
'use strict';


module.exports = function (config) {

  var product = {};
  var options = {};


  product.title = function () {

    return config.id;
  };


  product.price = function () {

    if (typeof config.price === 'number') {
      return config.price * (options.quantity || 1);
    }
  };


  product.options = function (opt) {

    options = opt;
  };


  return product;
};

