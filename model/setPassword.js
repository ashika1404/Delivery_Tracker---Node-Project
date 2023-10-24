const Joi = require('joi');

const setPassword = Joi.object({
    password: Joi.string().required().min(8).pattern(new RegExp('^[a-zA-Z0-9]+$')),
    confirm_password: Joi.string().required().valid(Joi.ref('password'))
});

module.exports = setPassword;