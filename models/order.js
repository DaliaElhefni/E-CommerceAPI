const mongoose = require('mongoose');

const Schema = mongoose.Schema

const orderSchema = new Schema({
    date: { type: Date, required: true, default: Date.now() },
    address: { type: String, required: true },
    totalprice: { 
        type: Number, 
        required: true,
        min : 0, 
        default: 0
    },
    status: { 
        type: String, 
        required: true,
        default: "pending",
        validate: {
            validator: function (v) {
                let values = ["pending","accepted, rejected"]
                return values.includes(v.toLowerCase());
            },
            message: props => `${props.value} is not a valid order status!`
        }, 
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
