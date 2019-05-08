'use strict';

const util = require('util');
const path = require('path');
const express = require('express');
const router = express.Router();
const CUSTOMERS = '../models/customers-mongodb';
const customers = require(CUSTOMERS);

const log   = require('debug')('basic-pos:router-customers');
const error = require('debug')('basic-pos:error');
const uuid = require('uuid/v4');

// const usersRouter = require('./users');

//const messagesModel = require('../models/messages-sequelize');

// Add Customer (create)
router.get('/add', (req, res, next) => {
    res.render('customeredit', {
        pageTitle: "Add a Customer",
        docreate: true,
        name : "",
        customer: null,
        breadcrumbs: [
            { href: '/', text: 'Home' },
            { active: true, text: "Add Customer" }
        ],
        hideAddCustomer: true
    });
});

// Save Customer (update)
router.post('/save', (req, res, next) => {
    var p;
    var id = req.body.id == null ? uuid() : req.body.id;
    if (req.body.docreate === "create") {
        p = customers.create(id,
                req.body.firstName, req.body.lastName, 
                req.body.streetAddress, req.body.streetAddress2, 
                req.body.city, req.body.state, req.body.zip,
                req.body.phone);
    } else {
        p = customers.update(req.body.id,
            req.body.firstName, req.body.lastName, 
            req.body.streetAddress, req.body.streetAddress2, 
            req.body.city, req.body.state, req.body.zip,
            req.body.phone);
    }
    p.then(customer => {
        res.redirect('/customers/view?id='+id);
    })
    .catch(err => { error(err); next(err); });
});

// Read Customer (read)
router.get('/view', (req, res, next) => {
    customers.read(req.query.id)
    .then(customer => {
        res.render('customerview', {
            pageTitle: customer ? customer.firstName+ " "+ customer.lastName : "",
            id: req.query.id,
            customer: customer,
            breadcrumbs: [
                { href: '/', text: 'Home' },
                { active: true, text: customer.firstName+ " "+ customer.lastName }
            ]
        });
    })
    .catch(err => { next(err); });
});

// View All
router.get('/viewall', (req, res, next) => {
    getCustomerIdNamesList()
    .then( customers => {
        res.render('customerlist', {
            pageTitle: "Customer List",
            customers : customers,
            breadcrumbs: [
                { href: '/', text: 'Home' },
                { active: true, text: "Customer List" }
            ]
        });
    });
});

var getCustomerIdNamesList = function() {
    log('getCustomerIdNamesList')
    return customers.keylist()
    .then(keylist => {
        var keyPromises = keylist.map( id => {
            return customers.read(id).then(customer => {
                return { id: customer.id, 
                    name: customer.firstName + " " + customer.lastName,
                phone: customer.phone };
            });
        });
        return Promise.all(keyPromises);
    });
};

// Edit customer (update)
router.get('/edit', (req, res, next) => {
    customers.read(req.query.id)
    .then(customer => {
        res.render('customeredit', {
            pageTitle: customer ? ("Edit " + customer.firstName+ " "+ customer.lastName) : "Add a Customer",
            docreate: false,
            id: req.query.id,
            customer : customer,
            hideAddNote: true,
            breadcrumbs: [
                { href: '/', text: 'Home' },
                { active: true, text: customer.firstName+ " "+ customer.lastName }
            ]
        });
    })
    .catch(err => { next(err); });
});

// Ask to Delete note (destroy)
router.get('/destroy', (req, res, next) => {
    customers.read(req.query.id)
    .then(customer => {
        res.render('customerdestroy', {
            pageTitle: customer ? customer.firstName+ " "+ customer.lastName : "",
            customer : customer,
            id: req.query.id,
            breadcrumbs: [
                { href: '/', text: 'Home' },
                { active: true, text: 'Delete Customer' }
            ]
        });
    })
    .catch(err => { next(err); });
});

// Really destroy customer (destroy)
router.post('/destroy/confirm', (req, res, next) => {
    customers.destroy(req.body.id)
    .then(() => { res.redirect('/'); })
    .catch(err => { next(err); });
});

router.post('/make-comment', (req, res, next) => {
    // log(util.inspect(req.body));
    messagesModel.postMessage(req.body.from, req.body.namespace, req.body.message)
    .then(results => { res.status(200).json({ }); })
    .catch(err => { res.status(500).end(err.stack); });
});

router.post('/del-message', (req, res, next) => {
    // log(util.inspect(req.body));
    log('/del-message');
    messagesModel.destroyMessage(req.body.id, req.body.namespace)
    .then(results => { log('SUCCESS /del-message'); res.status(200).json({ }); })
    .catch(err => { error('/del-message '+ err.stack); res.status(500).end(err.stack); });
});

module.exports = router;

// module.exports.socketio = function(io) {
    
//     var nspView = io.of('/view');
//     nspView.on('connection', function(socket) {
//         // 'cb' is a function sent from the browser, to which we
//         // send the messages for the named note.
//         log(`/view connected on ${socket.id}`);
//         socket.on('getnotemessages', (namespace, cb) => {
//             log('getnotemessages ' + namespace);
//             messagesModel.recentMessages(namespace)
//             .then(cb)
//             .catch(err => console.error(err.stack));
//         });
//     });

//     var forNoteViewClients = function(cb) {
//         nspView.clients((err, clients) => {
//             clients.forEach(id => {
//                 cb(nspView.connected[id]);
//             });
//         });
//     };

//     messagesModel.on('newmessage',  newmsg => {
//         forNoteViewClients(socket => { socket.emit('newmessage', newmsg); });
//     });
//     messagesModel.on('destroymessage',  data => {
//         forNoteViewClients(socket => { socket.emit('destroymessage', data); });
//     });
    
//     notes.events.on('noteupdate',  newnote => {
//         forNoteViewClients(socket => { socket.emit('noteupdate', newnote); });
//     });
//     notes.events.on('notedestroy', data => {
//         forNoteViewClients(socket => { socket.emit('notedestroy', data); });
//         messagesModel.destroyMessages('/view-'+ data.key)
//         .catch(err => console.error(err.stack));
//     });
// };

