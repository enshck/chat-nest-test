import Joi = require('joi');

export const registrationSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).max(18).trim().required(),
  userName: Joi.string().min(1).max(20).trim().required(),
});

export const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).max(18).trim().required(),
});
