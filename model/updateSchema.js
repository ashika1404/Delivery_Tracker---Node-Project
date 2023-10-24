const Joi = require('joi');

const updateSchema = Joi.object({
    status: Joi.string().valid('Ordered', 'In Transit', 'Out for Delivery', 'Delivered').required(),
    otp: Joi.when('status', {
        is: 'Delivered',
        then: Joi.number().required(),
        otherwise: Joi.forbidden()
    }),
    comments: Joi.string()
})
module.exports = updateSchema;
