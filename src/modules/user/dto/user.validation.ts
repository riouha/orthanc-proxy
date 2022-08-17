import Joi from "joi";
import { ProfessionalGroupItems } from "../entities/user.entity";

export const SignupSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  firstName: Joi.string(),
  lastName: Joi.string(),
  country: Joi.string(),
  professionalGroups: Joi.array().items(
    Joi.string().valid(...ProfessionalGroupItems)
  ),
});

export const LoginSchema = Joi.object({
  email: Joi.string().min(3).required(),
  password: Joi.string().required(),
});

export const VerifySchema = Joi.object({
  email: Joi.string().min(3).required(),
  hash: Joi.string().required(),
});

export const ForgetPassword = Joi.object({
  email: Joi.string().min(3).required(),
});
export const ChangePassword = Joi.object({
  email: Joi.string().min(3).required(),
  hash: Joi.string().required(),
  newPassword: Joi.string().min(6).required(),
});
