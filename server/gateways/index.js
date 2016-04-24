'use strict';


const Joi = require('joi');
const Boom = require('boom');


const internals = {
  gateways: {
    tco: require('./tco')
  }
};


exports.get = function (id) {

  return internals.gateways[id];
};


exports.list = {
  description: 'List available payment gateways',
  handler: function (req, reply) {

    const settings = req.server.settings.app;

    reply([{
      id: 'tco',
      sellerId: settings.tco.sellerId,
      publishableKey: settings.tco.publishableKey,
      sandbox: settings.tco.sandbox
    }]);
  }
};


exports.ins = {
  description: 'Handle INS notifications from 2checkout.',
  handler: function (req, reply) {

    console.log('INS', req.params, req.payload);

    reply({
      params: req.params,
      payload: req.payload
    });
  }
};

