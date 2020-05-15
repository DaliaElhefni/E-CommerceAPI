const joi = require('@hapi/joi');

const Productschema = joi.object({
    title: joi.string().required(),
    price: joi.number().required().min(0),
    quantity:joi.number().required().min(0),
    details: joi.string().required(), 
    productimage: joi.string(),
    promotion:joi.number().min(0).default(0),
    isdeleted:joi.bool().default(false)
});

const ValidateProduct = prd => Productschema.validate(prd, { abortEarly: false });

 module.exports = ValidateProduct;