'use strict';

const util = require('util');

const log   = require('debug')('basic-pos:Product');
const error = require('debug')('basic-pos:error');

module.exports = class Product {
    constructor(SKU, name, description, price, instock, image) {
        this.SKU = SKU;
        this.name = name;
        this.description = description;
        this.price = price;
        this.instock = instock;
        this.image = image;
    }
    
    get JSON() {
        return JSON.stringify({
            SKU: this.SKU, name: this.name, description: this.description,
            price : this.price, instock : this.instock, image : this.image
        });
    }
    
    static fromJSON(json) {
        var data = JSON.parse(json);
        var obje = new Product(data.SKU, data.name, data.description, data.price, data.instock, data.image);
        log(json +' => '+ util.inspect(obje));
        return obje;
    }
};