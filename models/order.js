const mongoose = require('mongoose');

const Schema = mongoose.Schema

const orderSchema = new Schema({
    date: { type: Date, required: true, default: Date.now() },
    address: { type: String, required: true },
    totalprice: { 
        type: Number, 
        required: true,
        min : 0
    },
    status: { 
        type: String, 
        required: true,
        validate: {
            validator: function (v) {
                values = ["pending","accepted, rejected"]
                return this.values.includes(v.toLowerCase());
            },
            message: props => `${props.value} is not a valid order status!`
        }
     },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    products: [{
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Product'
    }]
})

module.exports = mongoose.model('Order', orderSchema);
