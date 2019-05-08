'use strict';

const util = require('util');
const path = require('path');
const express = require('express');
const router = express.Router();
//const products = require(process.env.PRODUCTS_MODEL ? path.join('..', process.env.PRODUCTS_MODEL) : '../models/products-memory');
const PRODUCTS = '../models/products-mongodb';
const products = require(PRODUCTS);

const log   = require('debug')('basic-pos:router-products');
const error = require('debug')('basic-pos:error');

// const usersRouter = require('./users');

//const messagesModel = require('../models/messages-sequelize');

// Add Product (create)
router.get('/add', (req, res, next) => {
    res.render('productedit', {
        pageTitle: "Add a Product",
        docreate: true,
        name : "",
        product: undefined,
        breadcrumbs: [
            { href: '/', text: 'Home' },
            { active: true, text: "Add Product" }
        ],
        hideAddProduct: true
    });
});

// Save Product (update)
router.post('/save', (req, res, next) => {
    var p;
    if (req.body.docreate === "create") {
        p = products.create(req.body.SKU,
                req.body.name, req.body.description, 
                req.body.price, req.body.instock, req.body.image);
    } else {
        p = products.update(req.body.SKU,
                req.body.name, req.body.description,
                req.body.price, req.body.instock, req.body.image);
    }
    p.then(product => {
        res.redirect('/products/view?SKU='+ req.body.SKU);
    })
    .catch(err => { error(err); next(err); });
});

// Read Product (read)
router.get('/view', (req, res, next) => {
    products.read(req.query.SKU)
    .then(product => {
        res.render('productview', {
            pageTitle: product ? product.name : "",
            SKU: req.query.SKU,
            product: product,
            breadcrumbs: [
                { href: '/', text: 'Home' },
                { active: true, text: product.name }
            ]
        });
    })
    .catch(err => { next(err); });
});

// View All Products
router.get('/viewall', (req, res, next) => {
    getProductSkuNamesList()
    .then( products => {
        res.render('productlist', {
            pageTitle: "Product List",
            productlist : products,
            breadcrumbs: [
                { href: '/', text: 'Home' },
                { active: true, text: "Product List" }
            ]
        });
    });
});

var getProductSkuNamesList = function() {
    log('getProductSkuNamesList')
    return products.keylist()
    .then(keylist => {
        var keyPromises = keylist.map( SKU => {
            return products.read(SKU).then(product => {
                return { SKU: product.SKU, name: product.name, 
                    instock: product.instock, price : product.price };
            });
        });
        return Promise.all(keyPromises);
    });
};


// Edit product (update)
router.get('/edit', (req, res, next) => {
    products.read(req.query.sku)
    .then(product => {
        res.render('productedit', {
            pageTitle: product ? ("Edit " + product.name) : "Add a Product",
            docreate: false,
            SKU: req.query.sku,
            product : product,
            hideAddNote: true,
            breadcrumbs: [
                { href: '/', text: 'Home' },
                { active: true, text: product.name }
            ]
        });
    })
    .catch(err => { next(err); });
});

// Ask to Delete note (destroy)
router.get('/destroy', (req, res, next) => {
    var thesku = "";
    if( req.query.SKU != "" )
    {
        thesku = req.query.SKU;
    } 
    if ( req.query.sku != "" )
    {
        thesku = req.query.sku;
    }
    log("thesku: "+ thesku );
    products.read(thesku)
    .then(product => {
        res.render('productdestroy', {
            pageTitle: product ? product.name : "",
            product : product,
            sku: thesku,
            breadcrumbs: [
                { href: '/', text: 'Home' },
                { active: true, text: 'Delete Product' }
            ]
        });
    })
    .catch(err => { next(err); });
});

// Really destroy product (destroy)
router.post('/destroy/confirm', (req, res, next) => {
    products.destroy(req.body.SKU)
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

module.exports.socketio = function(io) {
    
    var nspView = io.of('/view');
    nspView.on('connection', function(socket) {
        // 'cb' is a function sent from the browser, to which we
        // send the messages for the named note.
        log(`/view connected on ${socket.id}`);
        socket.on('getnotemessages', (namespace, cb) => {
            log('getnotemessages ' + namespace);
            messagesModel.recentMessages(namespace)
            .then(cb)
            .catch(err => console.error(err.stack));
        });
    });

    var forNoteViewClients = function(cb) {
        nspView.clients((err, clients) => {
            clients.forEach(id => {
                cb(nspView.connected[id]);
            });
        });
    };

    messagesModel.on('newmessage',  newmsg => {
        forNoteViewClients(socket => { socket.emit('newmessage', newmsg); });
    });
    messagesModel.on('destroymessage',  data => {
        forNoteViewClients(socket => { socket.emit('destroymessage', data); });
    });
    
    notes.events.on('noteupdate',  newnote => {
        forNoteViewClients(socket => { socket.emit('noteupdate', newnote); });
    });
    notes.events.on('notedestroy', data => {
        forNoteViewClients(socket => { socket.emit('notedestroy', data); });
        messagesModel.destroyMessages('/view-'+ data.key)
        .catch(err => console.error(err.stack));
    });
};

