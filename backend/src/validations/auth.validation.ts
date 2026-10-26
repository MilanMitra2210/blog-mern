import Joi from 'joi';

export const registerSchema = Joi.object({
  name: Joi.string().trim().min(2).max(100).required().messages({
    'string.empty': 'Name is required',
    'string.min': 'Name must be at least 2 characters',
  }),
  email: Joi.string().email().trim().lowercase().required().messages({
    'string.email': 'Please provide a valid email address',
    'string.empty': 'Email is required',
  }),
  password: Joi.string().min(6).max(128).required().messages({
    'string.min': 'Password must be at least 6 characters',
    'string.empty': 'Password is required',
  }),
  confirmPassword: Joi.string().valid(Joi.ref('password')).optional().messages({
    'any.only': 'Passwords do not match',
  }),
  role: Joi.string().valid('ADMIN', 'USER').optional(),
});

export const loginSchema = Joi.object({
  email: Joi.string().email().trim().lowercase().required().messages({
    'string.email': 'Please provide a valid email address',
    'string.empty': 'Email is required',
  }),
  password: Joi.string().required().messages({
    'string.empty': 'Password is required',
  }),
});

export const refreshTokenSchema = Joi.object({
  refresh_token: Joi.string().required().messages({
    'string.empty': 'Refresh token is required',
  }),
});
