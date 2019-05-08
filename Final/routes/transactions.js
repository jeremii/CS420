'use strict';

const util = require('util');
const path = require('path');
const express = require('express');
const router = express.Router();
const TRANSACTIONS = '../models/transactions-mongodb';
const transactions = require(TRANSACTIONS);
const PRODUCTS = '../models/products-mongodb';
const products = require(PRODUCTS);
const CUSTOMERS = '../models/customers-mongodb';
const customers = require(CUSTOMERS);

const log   = require('debug')('basic-pos:router-transactions');
const error = require('debug')('basic-pos:error');

// const usersRouter = require('./users');

//const messagesModel = require('../models/messages-sequelize');
var getProductSkuNamesList = function() {
    log('getProductSkuNamesList')
    return products.keylist()
    .then(keylist => {
        var keyPromises = keylist.map( SKU => {
            return products.read(SKU).then(product => {
                return { SKU: product.SKU, name: product.name, 
                    instock: product.instock };
            });
        });
        return Promise.all(keyPromises);
    });
};

var getSalesNamesList = function() {
    log('getProductSkuNamesList')
    return transactions.keylist()
    .then(keylist => {
        var keyPromises = keylist.map( id => {
            return transactions.read(id).then(transaction => {
                return customers.read(transaction.customer_id).then( customer => {
                    return { id: transaction.id, name: customer.firstName + " " + customer.lastName,
                    phone : customer.phone,
                salesTax : transaction.salesTax, totalPrice : transaction.totalPrice,
            products: Array.from(transaction.products)  };
                })
            });
        });
        return Promise.all(keyPromises);
    });
};


// Add Transaction (create)
router.get('/AddProducts', (req, res, next) => {
    var cust_id = req.query.customer_id;
    transactions.create(null, cust_id, null, null, null)
    .then(transaction => {
        getProductSkuNamesList()
        .then( products => {
            res.render('productlist', {
                pageTitle: "Add Products to Cart",
                docreate: true,
                name : "",
                transaction: transaction,
                productlist : products,
                breadcrumbs: [
                    { href: '/', text: 'Home' },
                    { active: true, text: "Add Products" }
                ],
                hideAddTransaction: true
            });
        });
    });
});
// Add Transaction (create)
router.get('/AddOne', (req, res, next) => {
    var id = req.query.id;
    var sku = req.query.sku;
    transactions.addProduct(id, sku)
    .then(transaction => {
        products.decrementInstock(sku)
        .then( product => { 
            getProductSkuNamesList()
            .then( productlist => {
                res.render('productlist', {
                    pageTitle: "Add Products to Cart",
                    docreate: true,
                    name : "",
                    transaction: transaction,
                    productlist : productlist,
                    breadcrumbs: [
                        { href: '/', text: 'Home' },
                        { active: true, text: "Add Products" }
                    ],
                    hideAddTransaction: true
                });
            });
        });
    });
});



// Add Transaction (create)
router.get('/add', (req, res, next) => {
    res.render('transactionedit', {
        pageTitle: "Add a Transaction",
        docreate: true,
        name : "",
        transaction: undefined,
        breadcrumbs: [
            { href: '/', text: 'Home' },
            { active: true, text: "Add Transaction" }
        ],
        hideAddTransaction: true
    });
});

// Place Order
router.get('/PlaceOrder', (req, res, next) => {
    var id = req.query.id;
    transactions.placeOrder(id)
    .then(transaction => {
        res.redirect('/transactions/thankyou');
    });
});

// Thank you
router.get('/thankyou', (req, res, next) => {
    res.render('transactionthankyou', {
        pageTitle: "Thank you",
        breadcrumbs: [
            { href: '/', text: 'Home' },
            { active: true, text: "Thank you screen" }
        ]
    });
});

// Save Transaction (update)
router.post('/save', (req, res, next) => {
    var p;
    if (req.body.docreate === "create") {
        p = transactions.create(req.body.id,
                req.body.customer_id, req.body.products, 
                req.body.salesTax, req.body.totalPrice);
    } else {
        p = transactions.update(req.body.id,
                req.body.customer_id, req.body.products,
                req.body.salesTax, req.body.totalPrice);
    }
    p.then(transaction => {
        res.redirect('/transactions/view?id='+ req.body.id);
    })
    .catch(err => { error(err); next(err); });
});

getSalesNamesList
// Read Transaction (read)
router.get('/viewall', (req, res, next) => {
    getSalesNamesList()
    .then(transactions => {
        res.render('transactionlist', {
            pageTitle: transactions ? "Sales List " : "",
            transactions: transactions,
            breadcrumbs: [
                { href: '/', text: 'Home' },
                { active: true, text: 'Sales' }
            ]
        });
    })
    .catch(err => { next(err); });
});


// Read Transaction (read)
router.get('/view', (req, res, next) => {
    transactions.read(req.query.id)
    .then(transaction => {
        customers.read( transaction.customer_id )
        .then( customer => {
            
            res.render('transactionview', {
                pageTitle: transaction ? "View Cart " : "",
                id: req.query.id,
                transaction: transaction,
                customer : customer,
                productsInCart: Array.from( transaction.products ),
                breadcrumbs: [
                    { href: '/', text: 'Home' },
                    { active: true, text: transaction.id }
                ]
            });
        });
    })
    .catch(err => { next(err); });
});

// Edit transaction (update)
router.get('/edit', (req, res, next) => {
    transactions.read(req.query.id)
    .then(transaction => {
        res.render('transactionedit', {
            pageTitle: transaction ? ("Edit " + transaction.id) : "Add a Transaction",
            docreate: false,
            id: req.query.id,
            transaction : transaction,
            hideAddNote: true,
            breadcrumbs: [
                { href: '/', text: 'Home' },
                { active: true, text: transaction.id }
            ]
        });
    })
    .catch(err => { next(err); });
});

// Ask to Delete note (destroy)
router.get('/destroy', (req, res, next) => {
    transactions.read(req.query.id)
    .then(transaction => {
        res.render('transactiondestroy', {
            pageTitle: transaction ? transaction.id : "",
            transaction : transaction,
            id: req.query.id,
            breadcrumbs: [
                { href: '/', text: 'Home' },
                { active: true, text: 'Delete Transaction' }
            ]
        });
    })
    .catch(err => { next(err); });
});

// Really destroy transaction (destroy)
router.post('/destroy/confirm', (req, res, next) => {
    transactions.destroy(req.body.id)
    .then(() => { res.redirect('/'); })
    .catch(err => { next(err); });
});

router.post('/make-comment', (req, res, next) => {
    // log(util.inspect(req.body));
    messagesModel.postMessage(req.body.from, req.body.customer_idspace, req.body.message)
    .then(results => { res.status(200).json({ }); })
    .catch(err => { res.status(500).end(err.stack); });
});

router.post('/del-message', (req, res, next) => {
    // log(util.inspect(req.body));
    log('/del-message');
    messagesModel.destroyMessage(req.body.id, req.body.customer_idspace)
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

