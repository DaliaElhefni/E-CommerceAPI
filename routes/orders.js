const express = require('express');
const orderModel = require('../models/order');
const userModel = require('../models/user');
const productModel = require('../models/product');


const validateOrder = require('../helpers/validateOrder');
const validateObjectId = require('../helpers/validateObjectId');
const validateUpdatedOrder = require('../helpers/validateUpdatedOrder');
const router = express.Router();




router.get('/', async (req, res) => {
    const orders = await orderModel.find({})
        .populate('user')
        .populate('products.product');
    res.send(orders);
});

router.post('/', async (req, res) => {

    const { error } = validateOrder(req.body);
    if (error) {
        return res.status(400).send(error.details);
    }

    let user = await userModel.findById(req.body.user);
    if (!user) {
        return res.status(404).send("User ID is not found!");
    }

    let productsIDs = req.body.products.map(function (e) {
        return e.product;
    });
    if (productsIDs.length !== new Set(productsIDs).size) {
        return res.status(400).send("Duplicate products are not allowed!");
    }

    //check if products exist
    let existedIds = await Promise.all(productsIDs.map(async function (e) {
        if (await productModel.findById(e)) {
            return true;
        }
        return false;
    }));
    if (existedIds.includes(false)) {
        return res.status(404).send("Product ID in products is not found!");
    }

    //decrease quantity of products 
    const orderedQuantitiesLessThanQuantities =  await Promise.all(req.body.products.map(async function (item) {
        const tempProduct = await productModel.findById(item.product);
        if (tempProduct.quantity >= item.quantityordered) {
            return true;
        }
        return false;
    }));
    if(orderedQuantitiesLessThanQuantities.includes(false)){
        return res.status(500).send("Some products are out of stock!");
    }

    req.body.products.forEach(async function (item) {
        if (await updateProductQuantity(item, '-')) {
            return res.status(500).send("Order insertion failed!");
        }
    });

    let order = new orderModel({
        ...req.body
    });
    order = await order.save();
    res.send(order);
});

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

router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    const { error } = validateObjectId(id);
    if (error) {
        return res.status(400).send("Invalid order ID");
    }
    let order = await orderModel.findById(id);
    if (!order) {
        return res.status(404).send("Order ID is not found!");
    }
    //increase quantity of products 
    order.products.forEach(async function (item) {
        if (await updateProductQuantity(item, '+')) {
            return res.status(500).send("Order deletion failed!");
        }
    });

    await orderModel.deleteOne({ _id: id }, function (err, result) {
        if (err) {
            return res.status(500).send(err);
        } else {
            return res.send("Order deleted Successfully");
        }
    });
});

router.patch('/:id', async (req, res) => {

    const { id } = req.params;
    const idError = validateObjectId(id);
    if (idError.error) {
        return res.status(400).send('Invalid order ID');
    }

    let order = await (await orderModel.findById(id));
    if (!order) {
        return res.status(404).send("Order ID is not found!");
    }

    const { error } = validateUpdatedOrder(req.body);
    if (error) {
        return res.status(400).send(error.details);
    }

    if (req.body.status &&  req.body.status !== order.status && req.body.status === 'rejected') {
        //increase quantity of products 
        order.products.forEach(async function (item) {
            if (await updateProductQuantity(item, '+')) {
                return res.status(500).send("Update status to rejected failed!");
            }
        });
    }

    await orderModel.findByIdAndUpdate({ '_id': id }, req.body, { new: true }, function (err, result) {
        if (err) {
            res.status(500).send(err);
        }
        else {
            res.send(result);
        }
    })
});

router.get('/:id', async (req, res) => {
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