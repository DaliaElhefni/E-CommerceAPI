const express = require('express');
const router = express.Router();
const productModel = require('../models/product');
const ValidateProduct = require('../Helpers/validateProduct');
const ValidateobjectId = require('../Helpers/validateObjectId');
const multer = require('multer');

const storage = multer.diskStorage({
    destination: function (req, file, callback) {
        callback(null, './uploads/');
    }
    ,
    filename: function (req, file, callback) {
        callback(null, file.originalname);
    }
});

const fileFilter = (req, file, callback) => {
    if (file.mimetype == 'image/jpeg' || file.mimetype == 'image/png' || file.mimetype == 'image/jpg') {
        //accept
        callback(null, true);
    } else {
        //reject
        callback(null, false);
    }
};

const upload = multer({ storage: storage, fileFilter: fileFilter });

router.get('/', async (req, res) => {
    const products = await productModel.find();
    console.log(products);
    res.send(products);
});

router.post('/', upload.single('productimage'), async (req, res, next) => {
    //validate product
    console.log(req.file);
    const { error } = ValidateProduct(req.body);
    if (error) { return res.status(400).send(error.details); }
    let product = new productModel({
        ...req.body
        // ,
        // productimage: req.file.path
    });
    product = await product.save();
    res.send(product);
});

router.delete('/:id', async (req, res) => {
    const { id } = req.params;

    const { error } = ValidateobjectId(id);
    if (error) { return res.status(400).send('Invalid product ID!'); }

    let product = await productModel.findById(id);
    if (!product) {
        return res.status(404).send("Product ID is not found!");
    }
    product.isdeleted = true;

    // const message = await productModel
    //     .findByIdAndRemove(req.params.id)
    //     .then(() => 'Product Deleted Successfully!');

    // res.json({ message});
    await productModel.findByIdAndUpdate({ '_id': id }, product, { new: true }, function (err, result) {
        if (err) {
            return res.status(500).send(err);
        }
        else{
            res.send(result);
        }
    });
});

router.patch('/:id', upload.single('productimage'), async (req, res) => {
    const { id } = req.params;

    const { error } = ValidateobjectId(id);
    if (error) { return res.status(400).send('Invalid product ID!'); }

    let product = await productModel.findById(id);
    if (!product) {
        return res.status(404).send("Product ID is not found!");
    }

    console.log(req.body);
    let updatedProduct = Object.assign({}, product._doc, req.body);
    delete updatedProduct._id;
    delete updatedProduct.__v;
    if(req.file){
        updatedProduct.productimage = req.file.path;
    }
    
    //validation for product..
    const productError = ValidateProduct(updatedProduct);
    if (productError.error) { return res.status(400).send(productError.error.details); }

    // await productModel.update({ $set: { details:  req.body.details }},
    //     { where: { _id: req.params.id } })
    //     .then((result) => {
    //         console.log("hii");
    //         res.json(result);
    //     })
    //     .catch((err) => {
    //         console.log("bye");

    //         res.json(err);
    //     });

    await productModel.findByIdAndUpdate({ '_id': id }, updatedProduct, { new: true }, function (err, result) {
        if (err) {
            return res.status(500).send(err);
        }
        else{
            res.send(result);
        }
    });
    
});

router.get('/promotions', async (req, res) => {
    const products = await productModel.find({promotion: { $ne: 0 } });
    console.log(products);
    res.send(products);
});

router.get('/search/:name', async (req, res) => {
    const products = await productModel.find({title: { "$regex": req.params.name, "$options": "i" }});
    res.send(products);
});

router.get('/:id', async (req, res) => {
    const { id } = req.params;

    const { error } = ValidateobjectId(id);
    if (error) { return res.status(400).send('Invalid product ID!'); }

    const product = await productModel.findById(id);
    if (!product) {
        return res.status(404).send("Product ID is not found!");
    }
    console.log(product);
    res.send(product);
});

module.exports = router;