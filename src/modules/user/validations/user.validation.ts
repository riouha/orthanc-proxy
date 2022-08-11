import Joi from "joi";

export const SignupSchema = Joi.object({
  username: Joi.string().min(3).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
});

export const LoginSchema = Joi.object({
  username: Joi.string().min(3).required(),
  password: Joi.string().required(),
});
