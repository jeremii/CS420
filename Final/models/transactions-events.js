'use strict';

const EventEmitter = require('events');
const util         = require('util');

const log   = require('debug')('basic-pos:router-events');
const error = require('debug')('basic-pos:error');

class TransactionsEmitter extends EventEmitter {}

module.exports = new TransactionsEmitter();

module.exports.transactionCreated = function(obje) {
    log('transactionCreated '+ util.inspect(obje));
    module.exports.emit('transactioncreated', obje);
};

module.exports.transactionUpdate = function(obje) {
    log('transactionUpdate '+ util.inspect(obje));
    module.exports.emit('transactionupdate', obje);
};

module.exports.transactionDestroy = function(data) {
    log('transactionDestroy '+ util.inspect(data));
    module.exports.emit('transactiondestroy', data);
};
