import Joi = require('joi');

export const messageSchema = Joi.object({
  content: Joi.string().min(1).required(),
  userId: Joi.string().required(),
});

export const updateMessageSchema = Joi.object({
  content: Joi.string().min(1).required(),
  id: Joi.string().required(),
});
