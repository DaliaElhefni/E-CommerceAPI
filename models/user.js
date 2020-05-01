const mongoose = require('mongoose');
mongoose.set('useFindAndModify', false);
require('mongoose-type-email');
const Schema = mongoose.Schema


const userSchema = new Schema({
    username: { type: String, required: true },
    phone: { 
        type: String, 
        required: true ,
        validate: {
            validator: function (v) {
                return /^[0][1]\d{9}$/.test(v);
            },
            message: props => `${props.value} is not a valid phone number!`
        }
    },
    email: {
        type: mongoose.SchemaTypes.Email,
        required: true
    },
    password: { type: String, required: true },
    gender: { 
        type: String, 
        required: true,
        validate: {
            validator: function (v) {
                var arr = ["female","male"]
                return arr.includes(v.toLowerCase());
            },
            message: props => `${props.value} is not a valid gender!`
        }
     },
    profileimage: { type: String, required: true },
    role: {
        type: String,
        required: true,
        default: "NormalUser"
    },
    products: [{
        product: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'Product'
        },
        quantityordered: {
            type: Number,
            default: 1,
        }
    }],
    orders:[{
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Order'
    }]
})

module.exports = mongoose.model('User', userSchema);
