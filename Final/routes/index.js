'use strict';

var util = require('util');
var path = require('path');
var express = require('express');
var router = express.Router();
var products = require( '../models/products-mongodb');
var customers = require( '../models/customers-mongodb');

const log   = require('debug')('basic-pos:router-home');
const error = require('debug')('basic-pos:error');

/* GET home page. */
router.get('/', function(req, res, next) {
    getCustomerIdFullNamesList()
    .then(customers => {
        res.render('index', {
            pageTitle: 'Transaction Mode',
            customers : customers,
            breadcrumbs: [{ href: '/', text: 'Home' },
                    { href : '/', text: 'New Transaction'}]
        });
    })
    .catch(err => { console.error('home page '+ err); next(err); });
});

module.exports = router;

var getCustomerIdFullNamesList = function() {
    log('getCustomerIdFullNamesList')
    return customers.keylist()
    .then(keylist => {
        var keyPromises = keylist.map( id => {
            return customers.read(id).then(customer => {
                return { id: customer.id, firstName: customer.firstName,
                lastName : customer.lastName, phone : customer.phone };
            });
        });
        return Promise.all(keyPromises);
    });
};

var getKeyNamesList = function() {
    log('getKeyNamesList')
    return products.keylist()
    .then(keylist => {
        var keyPromises = keylist.map(SKU => {
            return products.read(SKU).then(product => {
                return { SKU: product.SKU, name: product.name };
            });
        });
        return Promise.all(keyPromises);
    });
};

// module.exports.socketio = function(io) {
//     var emitProductNames = () => {
//         getKeyNamesList().then(productlist => {
//             io.of('/home').emit('productnames', { productlist });
//         });
//     };
//     products.events.on('productcreated', emitProductNames);
//     products.events.on('productupdate',  emitProductNames);
//     products.events.on('productdestroy', emitProductNames);
// };