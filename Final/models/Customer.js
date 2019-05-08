'use strict';

const util = require('util');

const log   = require('debug')('basic-pos:Product');
const error = require('debug')('basic-pos:error');


module.exports = class Customer {
    constructor(id, firstName, lastName, streetAddress, streetAddress2,
         city, state, zip, phone) {
        this.id = id;
        this.firstName = firstName;
        this.lastName = lastName;
        this.streetAddress = streetAddress;
        this.streetAddress2 = streetAddress2;
        this.city = city;
        this.state = state;
        this.zip = zip;
        this.phone = phone;
    }
    
    get JSON() {
        return JSON.stringify({
            id : this.id,
            firstName: this.firstName, lastName: this.lastName, 
            streetAddress: this.streetAddress, streetAddress2: this.streetAddress2,
            city : this.city, state : this.state, zip : this.zip, phone: this.phone
        });
    }
    
    static fromJSON(json) {
        var data = JSON.parse(json);
        var obje = new Customer(data.id, data.firstName, data.lastName, 
            data.streetAddress, data.streetAddress2, data.city, data.state, 
            data.zip, data.phone);
        log(json +' => '+ util.inspect(obje));
        return obje;
    }
};