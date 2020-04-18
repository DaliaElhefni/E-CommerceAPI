const Joi = require('@hapi/joi');
Joi.objectId = require('joi-objectid')(Joi);

const orderSchema = Joi.object({
    date: Joi
        .date()
        .default(Date.now()),
    address: Joi
        .string()
        ,
    totalprice: Joi
        .number()
        .min(0)
        .default(0),
    status: Joi
        .string().
        valid("pending", "accepted", "rejected")
        .default("pending")
});

const validateUpdatedOrder = order => orderSchema.validate(order, { abortEarly: false });

module.exports = validateUpdatedOrder;