import Joi from "joi";

export class ContactUsDto {
  email: string;
  message: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
}

export const ContactUsSchema = Joi.object({
  email: Joi.string().email().required(),
  message: Joi.string().min(1).required(),
  firstName: Joi.string(),
  lastName: Joi.string(),
  phone: Joi.string(),
});

export const SearchSchema = Joi.object({
  offset: Joi.number().integer().min(0),
  limit: Joi.number().integer().min(0),
});
