const Joi = require("joi");

const userSchema = Joi.object({
  email: Joi.string()
    .required()
    .messages({ "any.required": "missing required name field" }),
  password: Joi.string()
    .required()
    .messages({ "any.required": "missing required name field" }),
});

const subscriptionSchema = Joi.object({
  subscription: Joi.string()
    .valid(...["starter", "pro", "business"])
    .required()
    .messages({ "any.required": "missing required name field" }),
});

module.exports = {
  userSchema,
  subscriptionSchema,
};
