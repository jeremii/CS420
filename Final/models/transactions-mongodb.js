'use strict';

const util        = require('util');
const mongodb     = require("mongodb");
const MongoClient = require('mongodb').MongoClient;

const log         = require('debug')('basic-pos:mongodb-model');
const error       = require('debug')('basic-pos:error');

const Transaction     = require('./Transaction');

var db;

exports.connectDB = function() {
    return new Promise((resolve, reject) => {
        if (db) {
            return resolve(db);
        }
        // Connection URL
        var url = process.env.MONGO_URL;
        // Use connect method to connect to the Server
        MongoClient.connect(url, (err, _db) => {
            if (err) return reject(err);
            db = _db.db("mongo-pos");
            _db = _db.db("mongo-pos");
            resolve(_db);
        });
    });
};
exports.create = function( id, customer_id, products, salesTax, totalPrice) {
    return exports.connectDB()
    .then(db => {
        var obje = new Transaction(id, customer_id, products, salesTax, totalPrice);
        var collection = db.collection('transactions');
        log('CREATE '+ util.inspect(obje));
        return collection.insertOne({
            id: obje.id, customer_id: customer_id, products: products, 
            salesTax:salesTax, totalPrice:totalPrice
        }).then(result => { return obje; });
    });
};

exports.update = function(id, customer_id, products, salesTax, totalPrice, closed) {
    return exports.connectDB()
    .then(db => {
        var collection = db.collection('transactions');
        var transaction = collection.findOne( { id : id });
        var obje = new Transaction(id, customer_id, products, salesTax, 
            totalPrice, closed);
        
        log('UPDATE '+ util.inspect(obje));
        return collection.updateOne({ id: id },
            { $set: { customer_id: customer_id, products: products, salesTax:salesTax, totalPrice:totalPrice, closed:closed } })
        .then(result => { return obje; } );
    });
};

exports.addProduct = function( id, sku )
{
    return exports.connectDB()
    .then( db => {
        return exports.read( id )
        .then(transaction => {
            return db.collection('products').findOne({SKU : sku })
            .then(product => {
                var products = transaction.products;
                if( products == null )
                {
                    products = [product];
                    transaction.totalPrice = parseFloat(product.price)
                }else
                {
                    products = Array.from( transaction.products );
                    products.push(product);
                    transaction.totalPrice = parseFloat(transaction.totalPrice) + parseFloat(product.price);
                }
                var totalPrice = parseFloat(transaction.totalPrice).toFixed(2);
                var salesTax = (totalPrice*0.07).toFixed(2);
                var obje = new Transaction( id,transaction.customer_id, products, salesTax, totalPrice, false );
                log('ADD PRODUCT: '+ util.inspect(obje));
                return exports.update( id, transaction.customer_id, products, salesTax, totalPrice, false)
                .then( result => { return obje; });
            });
        });
    });
};

exports.placeOrder = function( id )
{
    return exports.connectDB()
    .then( db => {
        return exports.read( id )
        .then(transaction => {
            var obje = new Transaction( id,transaction.customer_id, transaction.products, transaction.salesTax, transaction.totalPrice, true );
            log('ADD PRODUCT: '+ util.inspect(obje));
            return exports.update( id, obje.customer_id, obje.products, obje.salesTax, obje.totalPrice, true)
            .then( result => { return obje; });
        });
    });
};


exports.read = function(id) {
    return exports.connectDB()
    .then(db => {
        var collection = db.collection('transactions');
        // Find some documents
        return collection.findOne({ id: id })
        .then(doc => {
            var obje = new Transaction(doc.id, doc.customer_id, doc.products, doc.salesTax, doc.totalPrice);
            log('READ '+ util.inspect(obje));
            return obje;
        });
    });
};



exports.destroy = function(id) {
    return exports.connectDB()
    .then(db => {
        var collection = db.collection('transactions');
        log('DELETE '+ id);
        return collection.findOneAndDelete({ id: id });
    });
};

exports.keylist = function() {
    return exports.connectDB()
    .then(db => {
        var collection = db.collection('transactions');
        return new Promise((resolve, reject) => {
            var keyz = [];
            collection.find({}).forEach(
                obje => { keyz.push(obje.id); },
                err  => {
                    if (err) reject(err);
                    else {
                        log('KEYLIST '+ util.inspect(keyz));
                        resolve(keyz);
                    }
                }
            );
        });
    });
};

exports.count = function() {
    return exports.connectDB()
    .then(db => {
        var collection = db.collection('transactions');
        return new Promise((resolve, reject) => {
            collection.count({}, (err, count) => {
                if (err) reject(err);
                else resolve(count);
            });
        });
    });
};