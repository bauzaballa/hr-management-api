import type Joi from 'joi';

export const formatJoiError = (error: Joi.ValidationError) => {
  return error.details.map((d) => ({
    field: d.path.join('.'),
    message: d.message.replace(/["]/g, ''),
  }));
};
