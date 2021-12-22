import Joi = require('joi');

export const createGroupSchema = Joi.object({
  name: Joi.string().min(1).max(20).trim().required(),
  description: Joi.string().min(20).max(200).trim().required(),
});

export const updateGroupSchema = Joi.object({
  groupId: Joi.string().required(),
  name: Joi.string().min(1).max(20).trim(),
  description: Joi.string().min(20).max(200).trim(),
}).min(2);
