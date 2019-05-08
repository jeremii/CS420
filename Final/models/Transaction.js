'use strict';

const util = require('util');

const log   = require('debug')('basic-pos:Product');
const error = require('debug')('basic-pos:error');
const uuid = require('uuid/v4');

module.exports = class Transaction {
    constructor(id, customer_id, products, salesTax, totalPrice, closed = false) {
        this.id = id == null ? uuid() : id;
        this.customer_id = customer_id;
        this.products = products;
        this.salesTax = salesTax;
        this.totalPrice = totalPrice;
        this.closed = closed;
    }
    
    get JSON() {
        return JSON.stringify({
            id : this.id,
            customer_id: this.customer_id, products: this.products, 
            salesTax: this.salesTax, totalPrice : this.totalPrice, closed : this.closed
        });
    }
    
    static fromJSON(json) {
        var data = JSON.parse(json);
        var obje = new Transaction(data.id, data.customer_id, data.products, 
            data.salesTax, data.totalPrice, data.closed);
        log(json +' => '+ util.inspect(obje));
        return obje;
    }
};