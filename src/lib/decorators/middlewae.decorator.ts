import "reflect-metadata";
import { RequestHandler } from "express";
import { MetadataKey } from "./decorator.enums";

export function Use(middleware: RequestHandler) {
  return function (target: any, key: string, descriptor: PropertyDescriptor) {
    const middlewares = Reflect.getMetadata(MetadataKey.Middleware, target, key) || [];
    middlewares.push(middleware);
    Reflect.defineMetadata(MetadataKey.Middleware, middlewares, target, key);
  };
}
