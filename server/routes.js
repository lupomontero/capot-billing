'use strict';


const Invoices = require('./invoices');
const Gateways = require('./gateways');


module.exports = [
  { path: '/_invoices', method: 'GET', config: Invoices.list },
  { path: '/_invoices/{id}', method: 'GET', config: Invoices.get },
  { path: '/_invoices/{id}/_pay', method: 'POST', config: Invoices.pay },
  { path: '/_gateways', method: 'GET', config: Gateways.list },
  //{ path: '/_billing/_ins', method: 'POST', config: Gateways.ins },
];

