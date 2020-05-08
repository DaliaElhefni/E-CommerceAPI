const express = require('express');
const router = express.Router();
const productModel = require('../models/product');
const ValidateProduct = require('../Helpers/validateProduct');
const ValidateobjectId = require('../Helpers/validateObjectId');
const verify = require('../helpers/validateToken');
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

// input: nothing
// output: return all products
router.get('/', async (req, res) => {
    const products = await productModel.find();
    res.send(products);
});

// input: request body + product image file
// output: return added product
router.post('/', [upload.single('productimage'), verify.verifyAdmin], async (req, res, next) => {
    //validate product
    const { error } = ValidateProduct(req.body);
    if (error) { return res.status(400).send(error.details); }
    let product = new productModel({
        ...req.body
        ,
        productimage: req.file.path
    });
    product = await product.save();
    res.send(product);
});

// input: product id 
// output: delete product (soft delete)
router.delete('/:id', verify.verifyAdmin, async (req, res) => {
    const { id } = req.params;

    const { error } = ValidateobjectId(id);
    if (error) { return res.status(400).send('Invalid product ID!'); }

    let product = await productModel.findById(id);
    if (!product) {
        return res.status(404).send("Product ID is not found!");
    }
    product.isdeleted = true;

    await productModel.findByIdAndUpdate({ '_id': id }, product, { new: true }, function (err, result) {
        if (err) {
            return res.status(500).send(err);
        }
        else{
            res.send(result);
        }
    });
});

// input: product id (and maybe an image for the product to be updated)
// output: update the product
router.patch('/:id', [upload.single('productimage'), verify.verifyAdmin], async (req, res) => {
    const { id } = req.params;

    const { error } = ValidateobjectId(id);
    if (error) { return res.status(400).send('Invalid product ID!'); }

    let product = await productModel.findById(id);
    if (!product) {
        return res.status(404).send("Product ID is not found!");
    }

    let updatedProduct = Object.assign({}, product._doc, req.body);
    delete updatedProduct._id;
    delete updatedProduct.__v;
    if(req.file){
        updatedProduct.productimage = req.file.path;
    }
    
    //validation for product..
    const productError = ValidateProduct(updatedProduct);
    if (productError.error) { return res.status(400).send(productError.error.details); }

    await productModel.findByIdAndUpdate({ '_id': id }, updatedProduct, { new: true }, function (err, result) {
        if (err) {
            return res.status(500).send(err);
        }
        else{
            res.send(result);
        }
    });
    
});

// input: nothing
// output: return products with promotions only
router.get('/promotions', async (req, res) => {
    const products = await productModel.find({promotion: { $ne: 0 } });
    res.send(products);
});

// input: get name of product to search for it
// output: return products that contain the given name
router.get('/search/:name', verify.verifyToken, async (req, res) => {
    const products = await productModel.find({title: { "$regex": req.params.name, "$options": "i" }});
    res.send(products);
});

// input: product id
// output: return specific product
router.get('/:id', verify.verifyToken, async (req, res) => {
    const { id } = req.params;

    const { error } = ValidateobjectId(id);
    if (error) { return res.status(400).send('Invalid product ID!'); }

    const product = await productModel.findById(id);
    if (!product) {
        return res.status(404).send("Product ID is not found!");
    }
    res.send(product);
});

module.exports = router;