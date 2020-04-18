const mongoose = require('mongoose');

const Schema = mongoose.Schema

const productSchema = new mongoose.Schema({

    title: {
        type: String,
        required: true
    },
    quantity: {
        type: Number,
        required: true,
        min: 0
    },
    price: {
        type: Number,
        required: true,
        min: 0
    },
    details: {
        type: String,
        required: true
    },
    productimage: {
        type: String,
        required: true
    },
    promotion: {
        type: Number,
        required: true,
        min: 0,
        max: 100,
        default: 0
    },
    isdeleted: {
        type: Boolean,
        required: true,
        default: false
    }
});

module.exports = mongoose.model('Product', productSchema);