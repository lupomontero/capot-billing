'use strict';


const Tco = require('2checkout-node');


exports.pay = function (req, cb) {

  const server = req.server;
  const settings = server.settings.app;
  const invoice = req.pre.invoice;
  const token = req.payload.options.token;

  const tco = new Tco({
    sellerId: settings.tco.sellerId,
    privateKey: settings.tco.privateKey,
    sandbox: settings.tco.sandbox
  });

  const params = {
    merchantOrderId: invoice.id,
    token: token,
    currency: 'USD',
    lineItems: invoice.entries.map((entry) => {

      return {
        // The type of line item that is being passed in. (Always Lower Case,
        // ‘product’, ‘shipping’, ‘tax’ or ‘coupon’, defaults to ‘product’)
        // Required
        type: 'product',
        // Name of the item passed in. (128 characters max, cannot use ‘<' or
        // '>’, defaults to capitalized version of ‘type’.) Required
        name: entry.title,
        // Quantity of the item passed in. (0-999, defaults to 1 if not passed
        // in or incorrectly formatted.) Optional
        quantity: entry.quantity,
        // Price of the line item. Format: 0.00-99999999.99, defaults to 0 if a
        // value isn’t passed in or if value is incorrectly formatted, no
        // negatives (use positive values for coupons). Required
        price: entry.amount,
        // Y or N. Will default to Y if the type is shipping. Optional
        tangible: entry.tangible === true ? 'Y' : 'N',
        // Your custom product identifier. Optional
        productId: entry.productId,
        // Sets billing frequency. Ex. ‘1 Week’ to bill order once a week. (Can
        // use # Week, # Month or # Year) Required for recurring lineitems.
        recurrence: entry.recurrence,
        // Sets how long to continue billing. Ex. ‘1 Year’. (Forever or # Week,
        // # Month, # Year) Required for recurring lineitems.
        duration: entry.duration,
        // Any start up fees for the product or service. Can be negative to
        // provide discounted first installment pricing, but cannot equal or
        // surpass the product price. Optional
        startupFee: entry.startupFee,
        options: Object.keys(entry.options).map((key) => {

          return {
            optName: key,
            optValue: 'lupomontero.com',
            optSurcharge: 0.00
          }
        })
      };
    }),
    billingAddr: {
      name: invoice.billingAddress.givenName + ' ' + invoice.billingAddress.familyName,
      addrLine1: invoice.billingAddress.streetAddress,
      //addrLine2: '',
      city: invoice.billingAddress.locality,
      state: invoice.billingAddress.region,
      zipCode: invoice.billingAddress.postCode,
      country: invoice.billingAddress.country,
      email: invoice.billingAddress.email,
      phoneNumber: invoice.billingAddress.tel
    }
  };

  tco.checkout.authorize(params, (err, data) => {

    const transaction = { gateway: 'tco', createdAt: new Date() };

    // Authorization failure will result in an error
    if (err) {
      transaction.ok = false;
      transaction.error = { message: err.message };
    }
    else if (data && data.response && data.response.responseCode === 'APPROVED') {
      transaction.ok = true;
      transaction.result = data.response;
      // TODO: Check that the correct amount was paid.
    }
    else {
      // TODO: Handle `data.exception` and `data.validationErrors`
      //transaction.ok = false;
      transaction.result = data.response;
    }

    cb(null, transaction);
  });
};

