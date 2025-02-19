const Joi = require("joi");

const addSchema = Joi.object({
  name: Joi.string()
    .required()
    .messages({ "any.required": "missing required name field" }),
  email: Joi.string()
    .required()
    .messages({ "any.required": "missing required name field" }),
  phone: Joi.string()
    .required()
    .messages({ "any.required": "missing required name field" }),
});

const addFavoriteSchema = Joi.object({
  favorite: Joi.boolean()
    .required()
    .messages({ "any.required": "missing required name field" }),
});

module.exports = {
  addSchema,
  addFavoriteSchema,
};
