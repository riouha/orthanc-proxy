import "reflect-metadata";
import { RequestHandler } from "express";
import { RestMethods, MetadataKey } from "./decorator.enums";
//========================================
interface IRouteHandlerDescriptor extends PropertyDescriptor {
  value?: RequestHandler;
}

function routeBinder(method: RestMethods) {
  return function (path: string) {
    return function (target: any, key: string, descriptor: IRouteHandlerDescriptor) {
      Reflect.defineMetadata(MetadataKey.Method, method, target, key);
      Reflect.defineMetadata(MetadataKey.Path, path, target, key);
    };
  };
}

export const Get = routeBinder(RestMethods.Get);
export const Post = routeBinder(RestMethods.Post);
export const Put = routeBinder(RestMethods.Put);
export const Patch = routeBinder(RestMethods.Patch);
export const Delete = routeBinder(RestMethods.Delete);
