const Joi = require('joi');
const addressSchema = Joi.object({
    name: Joi.string().required(),
    email: Joi.string().email().required(),
    doorNo: Joi.string().required(),
    streetName: Joi.string().required(),
    city: Joi.string().required(),
    pincode: Joi.string().required()
});

const trackSchema = Joi.object({
    addressTo: addressSchema.required(),
    addressFrom: addressSchema.required(),
    typeOfGood: Joi.string().required(),
    weight: Joi.string().required(),
    typeOfDelivery: Joi.string().required(),
    returnAddress: Joi.string().required(),
    contactNumber: Joi.string().required(),
    expectedDeliveryDate: Joi.string().isoDate().required()
});

module.exports = trackSchema;