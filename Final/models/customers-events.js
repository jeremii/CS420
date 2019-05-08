'use strict';

const EventEmitter = require('events');
const util         = require('util');

const log   = require('debug')('basic-pos:router-events');
const error = require('debug')('basic-pos:error');

class CustomerEmitter extends EventEmitter {}

module.exports = new CustomerEmitter();

module.exports.customerCreated = function(obje) {
    log('customerCreated '+ util.inspect(obje));
    module.exports.emit('customercreated', obje);
};

module.exports.customerUpdate = function(obje) {
    log('customerUpdate '+ util.inspect(obje));
    module.exports.emit('customerupdate', obje);
};

module.exports.customerDestroy = function(data) {
    log('customerDestroy '+ util.inspect(data));
    module.exports.emit('customerdestroy', data);
};
