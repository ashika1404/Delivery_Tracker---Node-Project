const Joi = require('joi');

const authSchema = Joi.object({
    username: Joi.string().required().min(3).max(10),
    email: Joi.string().email().required(),
    userType: Joi.string().valid('admin', 'basic user', 'manager', 'delivery boy').required(),
    password: Joi.string().required().min(8).pattern(new RegExp('^[a-zA-Z0-9]+$'))
});

module.exports = authSchema;
