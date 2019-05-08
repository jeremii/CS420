'use strict';

const util        = require('util');
const mongodb     = require("mongodb");
const MongoClient = require('mongodb').MongoClient;

const log         = require('debug')('basic-pos:mongodb-model');
const error       = require('debug')('basic-pos:error');

const Customer     = require('./Customer');

const uuid = require('uuid/v4');

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
exports.create = function(id, firstName, lastName, streetAddress, streetAddress2,
     city, state, zip, phone) {
    return exports.connectDB()
    .then(db => {
        id = id == null ? uuid() : id;
        var obje = new Customer( id, firstName, lastName, streetAddress, streetAddress2, city, state, zip, phone);
        var collection = db.collection('customers');
        log('CREATE '+ util.inspect(obje));
        return collection.insertOne({ id:id,
            firstName: firstName, lastName: lastName, streetAddress: streetAddress, streetAddress2:streetAddress2, city:city, state:state, zip:zip, phone:phone
        }).then(result => { return obje; });
    });
};

exports.update = function(id, firstName, lastName, streetAddress, streetAddress2, city, state, zip, phone) {
    return exports.connectDB()
    .then(db => {
        var obje = new Customer(firstName, lastName, streetAddress, streetAddress2, city, state, zip, phone);
        var collection = db.collection('customers');
        log('UPDATE '+ util.inspect(obje));
        return collection.updateOne({ id: id },
            { $set: { firstName: firstName, lastName: lastName, streetAddress:streetAddress, streetAddress2:streetAddress2, city:city, state:state, zip:zip, phone:phone } })
        .then(result => { return obje; } );
    });
};

exports.read = function(id) {
    return exports.connectDB()
    .then(db => {
        var collection = db.collection('customers');
        // Find some documents
        return collection.findOne({ id: id })
        .then(doc => {
            var obje = new Customer(doc.id, doc.firstName, doc.lastName, doc.streetAddress, doc.streetAddress2, doc.city, doc.state, doc.zip, doc.phone);
            log('READ '+ util.inspect(obje));
            return obje;
        });
    });
};

exports.destroy = function(id) {
    return exports.connectDB()
    .then(db => {
        var collection = db.collection('customers');
        log('DELETE '+ id);
        return collection.findOneAndDelete({ id: id });
    });
};

exports.keylist = function() {
    return exports.connectDB()
    .then(db => {
        var collection = db.collection('customers');
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
        var collection = db.collection('customers');
        return new Promise((resolve, reject) => {
            collection.count({}, (err, count) => {
                if (err) reject(err);
                else resolve(count);
            });
        });
    });
};