const mongoose = require('mongoose');

const Schema = mongoose.Schema

const productSchema = new Schema({
    name: { type: String, required: true },
    price: {
        type: Number,
        required: true,
        min: 0
    },
    description: { type: String, required: true },
    picture: { type: String, required: true },
    promotion: {
        type: Number,
        required: true,
        min: 0,
        max: 100
    },
})

module.exports = mongoose.model('Product', productSchema);