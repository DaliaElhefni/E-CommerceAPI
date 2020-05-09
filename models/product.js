const mongoose = require('mongoose');

const Schema = mongoose.Schema

const productSchema = new mongoose.Schema({

    title: {
        type: String,
        required: true
        , default: ""

    },
    quantity: {
        type: Number,
        required: true,
        min: 0,
        default: 0

    },
    price: {
        type: Number,
        required: true,
        min: 0,
        default: 0

    },
    details: {
        type: String,
        required: true,
        default: ""

    },
    productimage: {
        type: String,
        required: true,
        default: "index.png"

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