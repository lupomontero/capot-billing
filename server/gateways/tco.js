'use strict';


const Tco = require('2checkout-node');


exports.pay = function (req, reply) {

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
    //total: '10.00',
    lineItems: [
      {
        // The type of line item that is being passed in. (Always Lower Case,
        // ‘product’, ‘shipping’, ‘tax’ or ‘coupon’, defaults to ‘product’)
        // Required
        type: 'product',
        // Name of the item passed in. (128 characters max, cannot use ‘<' or
        // '>’, defaults to capitalized version of ‘type’.) Required
        name: 'test',
        // Quantity of the item passed in. (0-999, defaults to 1 if not passed
        // in or incorrectly formatted.) Optional
        quantity: 1,
        // Price of the line item. Format: 0.00-99999999.99, defaults to 0 if a
        // value isn’t passed in or if value is incorrectly formatted, no
        // negatives (use positive values for coupons). Required
        price: 10,
        // Y or N. Will default to Y if the type is shipping. Optional
        tangible: 'N',
        // Your custom product identifier. Optional
        productId: 'domain',
        // Sets billing frequency. Ex. ‘1 Week’ to bill order once a week. (Can
        // use # Week, # Month or # Year) Required for recurring lineitems.
        recurrence: '1 Year',
        // Sets how long to continue billing. Ex. ‘1 Year’. (Forever or # Week,
        // # Month, # Year) Required for recurring lineitems.
        duration: 'Forever',
        // Any start up fees for the product or service. Can be negative to
        // provide discounted first installment pricing, but cannot equal or
        // surpass the product price. Optional
        startupFee: 0,
        options: [
          { optName: 'domainName', optValue: 'lupomontero.com', optSurcharge: 0.00 }
        ]
      }
    ],
    billingAddr: {
      name: 'Testing Tester',
      addrLine1: '123 Test St',
      //addrLine2: '',
      city: 'Columbus',
      state: 'Ohio',
      zipCode: '43123',
      country: 'USA',
      email: 'example@2co.com',
      phoneNumber: '5555555555'
    }
  };

  tco.checkout.authorize(params, (err, data) => {

    const transaction = { gateway: 'tco', createdAt: new Date() };

    invoice.transactions = invoice.transactions || [];

    // Authorization failure will result in an error
    if (err) {
      transaction.ok = false;
      transaction.error = { message: err.message };
    }
    else if (data && data.response && data.response.responseCode === 'APPROVED') {
      transaction.ok = true;
      transaction.result = data.response;
      // TODO: Check that the correct amount was paid.
      invoice.status = 'paid';
    }
    else {
      // TODO: Handle `data.exception` and `data.validationErrors`
      //transaction.ok = false;
      transaction.result = data.response;
    }

    invoice.transactions.push(transaction);

    //TODO: Mark invoice as paid if applicable...
    reply(invoice);
  });
};

