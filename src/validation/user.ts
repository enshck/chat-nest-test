import Joi = require('joi');

export const updateUserSchema = Joi.object({
  email: Joi.string().email(),
  userName: Joi.string().min(1).max(20).trim(),
}).min(1);
