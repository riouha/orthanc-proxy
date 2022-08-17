import "reflect-metadata";
import { Request, Response, NextFunction } from "express";
import Joi from "joi";
import { MetadataKey } from "./decorator.enums";
import { BadRequestError } from "../errors/BadRequest";

const path2property = (obj: any, value: any, path: any) => {
  let i;
  for (i = 0; i < path.length - 1; i++) {
    obj[path[i]] = {};
    obj = obj[path[i]];
  }
  obj[path[i]] = value;
};

const replaceObjectJoiError = (reqObj: any, errors: any) => {
  for (let i = 0; i < errors.length; i++) {
    const path = errors[i].path;
    path2property(reqObj, errors[i].message, path); //errors[i].type
  }
  return reqObj;
};

// request body validator for controllers in class (method decorator)
export const validationDecorator = (schema: Joi.ObjectSchema) => {
  return function (
    target: Object,
    key: string,
    descriptor: PropertyDescriptor
  ) {
    // target: prototype of class (field properties value is not defined in prototype and get value in construct pahse!)
    // descriptor of target[key] -> for methods: {value,writable,enumerable,configurable}
    const originalMethod = descriptor.value;
    descriptor.value = function (...args: any) {
      // const req = args[1].req;
      // const res = args[0].res;
      // const next = args[0].next;
      // const query = args[0].query;
      // const params = args[0].params;
      const body = args[0].body;

      const validationResult = schema.validate(body, { abortEarly: false });
      if (validationResult.error) {
        const resultValue = replaceObjectJoiError(
          validationResult.value,
          validationResult.error.details
        );
        throw new BadRequestError("input validation error", resultValue);
      }
      return originalMethod.apply(this, args);
    };
  };
};

// decorators only in class
// ****** decorators are applied (executed) when class deffinition code runs. not instance creation! ******
// decorators executed before any instance created

// method,property,accessor decorator -> target,key,descriptor
// parameter decorator -> target,key,index,descriptor
// class decorator -> target:constructor of class,descriptor

export function validationMiddleware(
  schema: Joi.ObjectSchema,
  targetField: ValidateInputTargetField
) {
  return function (req: Request, res: Response, next: NextFunction) {
    let target;
    switch (targetField) {
      case "BODY":
        target = req.body;
        break;
      case "PARAMS":
        target = req.params;
        break;
      case "QUERY":
        target = req.query;
        break;
      case "URL":
        target = { ...req.query, ...req.params };
        break;
      case "ALL3":
        target = { ...req.query, ...req.params, ...req.body };
        break;
    }

    const validationResult = schema.validate(target, { abortEarly: false });
    if (validationResult.error) {
      // access to request body => (validationResult.value);
      const resultValue = replaceObjectJoiError(
        {},
        validationResult.error.details
      );
      throw new BadRequestError("input validation error", resultValue);
    }
    next();
  };
}

export type ValidateInputTargetField =
  | "BODY"
  | "PARAMS"
  | "QUERY"
  | "URL"
  | "ALL3";
export interface IValidateInputMata {
  schema: Joi.ObjectSchema;
  field: ValidateInputTargetField;
}

export function ValidateInput(
  schema: Joi.ObjectSchema,
  field: ValidateInputTargetField = "BODY"
) {
  return function (target: any, key: string, descriptor: PropertyDescriptor) {
    Reflect.defineMetadata(
      MetadataKey.Validator,
      { schema, field },
      target,
      key
    );
  };
}
