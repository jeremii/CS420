'use strict';

const util = require('util');
const Products = require('./Product');

var products = [];

exports.update = exports.create = function(SKU, name, description, price, instock, image) {
    return new Promise((resolve, reject) => {
        products[SKU] = new Product(SKU, name, description, price, instock, image);
        resolve(products[SKU]);
    });
};

exports.read = function(SKU) {
    return new Promise((resolve, reject) => {
        if (products[SKU]) resolve(products[SKU]);
        else reject(`Product ${SKU} does not exist`);
    });
};

exports.destroy = function(SKU) {
    return new Promise((resolve, reject) => {
        if (products[SKU]) {
            delete products[SKU];
            resolve();
        } else reject(`Product ${SKU} does not exist`);
    });
};

exports.keylist = function() {
    return new Promise((resolve, reject) => {
        resolve(Object.keys(products));
    });
};

exports.count   = function()    {
    return new Promise((resolve, reject) => {
        resolve(products.length);
    });
};
