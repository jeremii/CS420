'use strict';

const EventEmitter = require('events');
const util         = require('util');

const log   = require('debug')('basic-pos:router-events');
const error = require('debug')('basic-pos:error');

class ProductsEmitter extends EventEmitter {}

module.exports = new ProductsEmitter();

module.exports.productCreated = function(obje) {
    log('productCreated '+ util.inspect(obje));
    module.exports.emit('productcreated', obje);
};

module.exports.productUpdate = function(obje) {
    log('productUpdate '+ util.inspect(obje));
    module.exports.emit('productupdate', obje);
};

module.exports.productDestroy = function(data) {
    log('productDestroy '+ util.inspect(data));
    module.exports.emit('productdestroy', data);
};
