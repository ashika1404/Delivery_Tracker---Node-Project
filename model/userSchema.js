const Joi = require('joi');

const userSchema = Joi.object({
    username: Joi.string().min(3).max(10),
    email: Joi.string().email(),
    userType: Joi.string().valid('admin', 'manager', 'delivery boy')
});

module.exports = userSchema;
