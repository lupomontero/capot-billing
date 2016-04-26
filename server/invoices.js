'use strict';


const Joi = require('joi');
const Boom = require('boom');
const Gateways = require('./gateways');


const internals = {};


internals.parse = function (doc) {

  doc.id = doc._id.split('/')[1];
  delete doc._id;
  delete doc._deleted_conflicts;
  return doc;
};


internals.getOne = function (req, reply) {

  const db = req.server.app.couch.db('billing');
  const id = req.params.id;
  const owner = req.auth.credentials.uid;

  db.get(encodeURIComponent('invoice/' + id), (err, data) => {

    if (err) {
      return reply(Boom.wrap(err, err.statusCode || 500, err.message));
    }

    reply(internals.parse(data));
  });
};



internals.getAll = function (req, cb) {

  const db = req.server.app.couch.db('billing');

  db.get('/_all_docs', {
    startkey: 'invoice/',
    endkey: 'invoice0',
    include_docs: true
  }, (err, data) => {

    if (err) {
      return cb(err);
    }

    const docs = data.rows.map((row) => {

      return internals.parse(row.doc);
    });

    cb(null, docs);
  });
};


internals.getByOwner = function (req, cb) {

  const db = req.server.app.couch.db('billing');
  const owner = req.auth.credentials.uid;

  db.query('by_owner', { key: [owner, 'invoice'] }, (err, rows) => {

    if (err) {
      return cb(err);
    }

    const docs = rows.map((row) => {

      return internals.parse(row.value);
    });

    cb(null, docs);
  });
};


exports.list = {
  description: 'List invoices',
  auth: 'user',
  //response: {},
  handler: function (req, reply) {

    if (req.auth.credentials.isAdmin) {
      return internals.getAll(req, (err, data) => {

        reply(err || data);
      });
    }

    internals.getByOwner(req, (err, data) => {

      reply(err || data);
    });
  }
};



exports.get = {
  auth: 'user',
  validate: {
    params: {
      id: Joi.string().required(),
    }
  },
  response: {
    schema: Joi.object().keys({
      _rev: Joi.string().required(),
      type: 'invoice',
      owner: Joi.string().required(),
      createdAt: Joi.string().required(),
      id: Joi.string().required(),
      dueAt: Joi.string().required(),
      status: Joi.string().required(),
      tax: Joi.number(),
      billingAddress: Joi.object(),
      entries: Joi.array().required(),
    })
  },
  pre: [{ method: internals.getOne, assign: 'invoice' }],
  handler: function (req, reply) {

    reply(req.pre.invoice);
  }
};


exports.pay = {
  description: 'Pay invoice.',
  auth: 'user',
  validate: {
    params: {
      id: Joi.string().required()
    },
    payload: {
      gateway: Joi.string().required().valid(['tco']),
      options: Joi.object().required()
    }
  },
  pre: [{ method: internals.getOne, assign: 'invoice' }],
  handler: function (req, reply) {

    const gateway = Gateways.get(req.payload.gateway);

    if (!gateway || typeof gateway.pay !== 'function') {
      reply(Boom.badRequest());
    }

    gateway.pay(req, (err, transaction) => {

      if (err) {
        return reply(err);
      }

      console.log(transaction);
      invoice.transactions = invoice.transactions || [];

      //invoice.status = 'paid';
      invoice.transactions.push(transaction);

      // TODO: Trigger "process-paid"?
      // TODO: Store updated invoice...

      reply(transaction);
    });
  }
};



