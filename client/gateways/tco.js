/*eslint no-var:0, prefer-arrow-callback: 0 */
'use strict';


module.exports = function (app, options) {

  var gateway = {};


  gateway.pay = function (invoice, args) {

    var errorCallback = function (err) {

      console.log('error', err);
    };

    var successCallback = function (data) {

      app.request('POST', '/_invoices/' + invoice.id + '/_pay', {
        gateway: 'tco',
        options: {
          token: data.response.token.token
        }
      }).then(function (data) {

        console.log('auth success', data);
      }, function (err) {

        console.log('auth error', err);
      });
    };


    args.sellerId = options.sellerId;
    args.publishableKey = options.publishableKey;

    TCO.loadPubKey(options.sandbox ? 'sandbox' : 'production', function () {

      TCO.requestToken(successCallback, errorCallback, args);
    });
  };


  return gateway;
};

