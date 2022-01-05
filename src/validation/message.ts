import Joi = require('joi');

export const messageSchema = Joi.object({
  content: Joi.string().min(1).required(),
  groupId: Joi.string().required(),
});

export const updateMessageSchema = Joi.object({
  content: Joi.string().min(1).required(),
  messageId: Joi.string().required(),
});
