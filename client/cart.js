/*eslint no-var:0, prefer-arrow-callback: 0 */
'use strict';


var Events = require('events');


module.exports = function Cart(app, products) {

  var cart = new Events.EventEmitter();


  cart.add = function (item) {

    if (!item) {
      throw new Error('cart.add() expects an object as its first argument');
    }

    var product = products.find(item.product);

    if (!product) {
      throw new Error('Unknown product!');
    }

    return app.store.add('cart', item);
  };


  cart.remove = function (id) {

    return app.store.remove('cart', id);
  };


  cart.findAll = function () {

    return app.store.findAll('cart');
  };


  cart.find = function (id) {

    return app.store.find('cart', id);
  };


  cart.toInvoiceEntries = function () {

    return cart.findAll().then(function (data) {

      return data.map(function (item) {

        var product = products.find(item.product);
        product.options(item.options);

        return {
          title: product.title(),
          amount: product.price(),
          product: {
            id: item.product,
            options: item.options
          }
        };
      });
    });
  };


  var emit = function (eventName) {

    return function () {

      var args = Array.prototype.slice.call(arguments, 0);
      cart.emit.apply(cart, [eventName].concat(args));
    };
  };

  ['add', 'update', 'remove'].forEach(function (eventName) {

    app.store.on(eventName, emit(eventName));
  });

  return cart;
};
