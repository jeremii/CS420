'use strict';

const util        = require('util');
const mongodb     = require("mongodb");
const MongoClient = require('mongodb').MongoClient;

const log         = require('debug')('basic-pos:mongodb-model');
const error       = require('debug')('basic-pos:error');

const Product     = require('./Product');

var db;

exports.connectDB = function() {
    return new Promise((resolve, reject) => {
        if (db) return resolve(db);
        // Connection URL
        var url = process.env.MONGO_URL;
        // Use connect method to connect to the Server
        MongoClient.connect(url, (err, _db) => {
            if (err) return reject(err);
            db = _db;
            resolve(_db);
        });
    });
};

exports.create = function(SKU, name, description, price, instock) {
    return exports.connectDB()
    .then(db => {
        var obje = new Product(SKU, name, description, price, instock);
        var collection = db.collection('products');
        log('CREATE '+ util.inspect(obje));
        return collection.insertOne({
            SKU: SKU, name: name, description: description, price:price, instock:instock
        }).then(result => { return obje; });
    });
};

exports.update = function(SKU, name, description, price, instock) {
    return exports.connectDB()
    .then(db => {
        var obje = new Product(SKU, name, description, price, instock);
        var collection = db.collection('products');
        log('UPDATE '+ util.inspect(obje));
        return collection.updateOne({ SKU: SKU },
            { $set: { name: name, description: description, price:price, instock:instock } })
        .then(result => { return obje; } );
    });
};

exports.read = function(SKU) {
    return exports.connectDB()
    .then(db => {
        var collection = db.collection('products');
        // Find some documents
        return collection.findOne({ SKU: SKU })
        .then(doc => {
            var obje = new Note(doc.SKU, doc.name, doc.description, doc.price, doc.instock);
            log('READ '+ util.inspect(obje));
            return obje;
        });
    });
};

exports.destroy = function(SKU) {
    return exports.connectDB()
    .then(db => {
        var collection = db.collection('products');
        log('DELETE '+ SKU);
        return collection.findOneAndDelete({ SKU: SKU });
    });
};

exports.keylist = function() {
    return exports.connectDB()
    .then(db => {
        var collection = db.collection('products');
        return new Promise((resolve, reject) => {
            var keyz = [];
            collection.find({}).forEach(
                obje => { keyz.push(obje.SKU); },
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
        var collection = db.collection('products');
        return new Promise((resolve, reject) => {
            collection.count({}, (err, count) => {
                if (err) reject(err);
                else resolve(count);
            });
        });
    });
};