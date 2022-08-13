import Joi from "joi";

export const SignupSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  firstName: Joi.string(),
  lastName: Joi.string(),
  country: Joi.string(),
});

export const LoginSchema = Joi.object({
  email: Joi.string().min(3).required(),
  password: Joi.string().required(),
});
