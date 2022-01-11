import Joi = require('joi');

export const messageSchema = Joi.object({
  content: Joi.string().min(1).required(),
  userId: Joi.string().required(),
});
