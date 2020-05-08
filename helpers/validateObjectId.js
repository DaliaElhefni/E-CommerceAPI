const Joi = require('@hapi/joi');
Joi.objectId = require('joi-objectid')(Joi);

const validateObjectId = id => Joi.objectId().validate(id);

module.exports = validateObjectId;