const Joi = require('@hapi/joi');
Joi.objectId = require('joi-objectid')(Joi);

const orderSchema = Joi.object({
    date: Joi
        .date()
        .default(Date.now()),
    address: Joi
        .string()
        .required(),
    totalprice: Joi
        .number()
        .min(0)
        .default(0),
    status: Joi
        .string().
        valid("pending", "accepted", "rejected")
        .default("pending"),
    user: Joi
        .objectId()
        .required()
        ,
    products: Joi
        .array()
        .items(Joi.object({
            product: Joi.objectId().required(),
            quantityordered: Joi.number().min(1).default(1)
        }))
});

const validateOrder = order => orderSchema.validate(order, { abortEarly: false });

module.exports = validateOrder;