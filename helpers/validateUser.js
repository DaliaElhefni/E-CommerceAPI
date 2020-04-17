const Joi = require('@hapi/joi');
Joi.objectId = require('joi-objectid')(Joi);

const userValidationSchema = Joi.object({
    username: Joi.string().required(),
    phone: Joi.string().regex(/^[0][1]\d{9}$/),
    email: Joi.string().email(),
    password: Joi.string().regex(/^[a-zA-Z0-9]{3,30}$/),
    gender: Joi.any().valid("male", "female"),
    picture: Joi.string(),
    role: Joi.string(),
    products: Joi.array().items(Joi.objectId()).default([]),
    orders: Joi.array().items(Joi.objectId()).default([])
});

const validateUser = user => userValidationSchema.validate(user,{abortEarly:false});

module.exports = validateUser;