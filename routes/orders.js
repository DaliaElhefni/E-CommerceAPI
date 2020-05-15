const express = require('express');
const orderModel = require('../models/order');
const userModel = require('../models/user');
const productModel = require('../models/product');


const validateOrder = require('../helpers/validateorder');
const validateObjectId = require('../helpers/validateobjectid');
const validateUpdatedOrder = require('../helpers/validateupdatedorder');
const verify = require('../helpers/validatetoken');
const router = express.Router();



// input: nothing
// output: return all orders
// router.get('/', verify.verifyAdmin, async (req, res) => {
router.get('/', async (req, res) => {

    const orders = await orderModel.find({})
        .populate('user')
        .populate('products.product');
    res.send(orders);
});

// input: orderProducts array
// output: caluclate total price of an order
function calculateOrderTotalPrice(products) {
    let totalPrice = 0;
    products.forEach(function (item) {
        totalPrice += (item.quantityordered * item.product.price)
    });
    return totalPrice;
}

// input: request body contains addres and userID
// output: new Order and empty user's cart
router.post('/', verify.verifyToken, async (req, res) => {
    const { error } = validateOrder(req.body);
    if (error) {
        return res.status(400).send(error.details);
    }

    let user = await userModel.findById(req.body.user);
    if (!user) {
        return res.status(404).send("User ID is not found!");
    }

    if(user.products.length === 0){
        return res.status(404).send("The cart is empty!");
    }

    let order = new orderModel({
        ...req.body
    });

    // get products from user's cart
    order.products = user.products;

    //get products from db to calculate the price and check if they are in stock
    let newProductsList = await Promise.all(order.products.map(async function (e) {
        const product = await productModel.findById(e.product);
        if (product.quantity >=  e.quantityordered) {
            return {product: product, quantityordered: e.quantityordered, inStock: true};
        }
        return {product: product, quantityordered: e.quantityordered, inStock: false};
    }));

    if(newProductsList.some(p => p.inStock === false)){
        return res.status(500).send("Some products are out of stock!");
    }

    order.products.forEach(async function (item) {
        if (await updateProductQuantity(item, '-')) {
            return res.status(500).send("Order insertion failed!");
        }
    });

    //calculate total price
    order.totalprice = calculateOrderTotalPrice(newProductsList);

    //empty cart and add order to user
    user.orders.push(order._id);
    user.products = [];
    await userModel.findByIdAndUpdate({ '_id': user._id }, user, { new: true }, function (err, result) {
        if (err) {
            return res.status(500).send(err);
        }
    });

    order = await order.save();
    res.send(order);
});

// input: object {productId, quantityOrdered} and operation (+ or -) to update product quantity according to the operation
// output: product quantity updated in db
async function updateProductQuantity(item, operation) {
    let product = await productModel.findById(item.product);
    if (operation === '+') {
        product.quantity += item.quantityordered;
    }
    else {
        product.quantity -= item.quantityordered;
    }
    await productModel.findByIdAndUpdate({ '_id': item.product }, product, { new: true }, function (err, result) {
        if (err) {
            return err;
        }
    });
}

// input: order id  =>  used when the order is cancelled
// output: delete order
router.delete('/:id', verify.verifyToken, async (req, res) => {
    const { id } = req.params;
    const { error } = validateObjectId(id);
    if (error) {
        return res.status(400).send("Invalid order ID");
    }
    let order = await orderModel.findById(id);
    if (!order) {
        return res.status(404).send("Order ID is not found!");
    }
    // increase quantity of products 
    order.products.forEach(async function (item) {
        if (await updateProductQuantity(item, '+')) {
            return res.status(500).send("Order deletion failed!");
        }
    });

    let user  = await userModel.findById(order.user);
    user.orders = user.orders.filter(o=> o._id.toString() !== id.toString());
    await user.save();

    await orderModel.deleteOne({ _id: id }, function (err, result) {
        if (err) {
            return res.status(500).send(err);
        } else {
            return res.send("Order deleted Successfully");
        }
    });
});

// input: order id  =>  updating order (users and products are not allowed to be updated)
// output: update order
router.patch('/:id', verify.verifyToken, async (req, res) => {

    const { id } = req.params;
    const idError = validateObjectId(id);
    if (idError.error) {
        return res.status(400).send('Invalid order ID');
    }

    let order = await (await orderModel.findById(id));
    if (!order) {
        return res.status(404).send("Order ID is not found!");
    }
    let tempOrder = {
        status: req.body.status,
        date:  req.body.date,
        address:  req.body.address,
        totalprice:  req.body.totalprice
    }
    const { error } = validateUpdatedOrder(tempOrder);
    if (error) {
        return res.status(400).send(error.details);
    }

    if (req.body.status && req.body.status !== order.status && req.body.status === 'rejected' && req.userRole === "admin") {
        //increase quantity of products 
        order.products.forEach(async function (item) {
            if (await updateProductQuantity(item, '+')) {
                return res.status(500).send("Update status to rejected failed!");
            }
        });
    }
    else if(req.body.status === 'rejected'){
        return res.status(400).send("Rejecting order failed!");
    }

    await orderModel.findByIdAndUpdate({ '_id': id }, req.body, { new: true }, function (err, result) {
        if (err) {
            return res.status(500).send(err);
        }
        else {
            return res.send(result);
        }
    });
});

// input: order id  =>  get specific order by its id
// output: order
router.get('/:id', verify.verifyToken, async (req, res) => {
    const { id } = req.params;
    const { error } = validateObjectId(id);
    if (error) {
        return res.status(400).send("Invalid order ID");
    }
    let order = await orderModel.findById(id).populate('user').populate('products.product');
    if (!order) {
        return res.status(404).send("Order ID is not found!")
    }
    return res.send(order);
});

module.exports = router;