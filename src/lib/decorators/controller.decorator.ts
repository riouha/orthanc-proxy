import "reflect-metadata";
import { RestMethods, MetadataKey } from "./decorator.enums";
import { IValidateInputMata, validationMiddleware } from "./valdation.decorators";
import { applicatonRouter } from "../../app/app.router";
//============================================

export function Controller(routePrefix: string) {
  return function (target: Function) {
    for (const key in target.prototype) {
      const routeHandler = target.prototype[key];

      const routeMethod: RestMethods = Reflect.getMetadata(MetadataKey.Method, target.prototype, key);
      const routePath: string = Reflect.getMetadata(MetadataKey.Path, target.prototype, key);

      const middlewares: any[] = Reflect.getMetadata(MetadataKey.Middleware, target.prototype, key) || [];

      // last middleware -> validate input
      const validatInputMetadata: IValidateInputMata = Reflect.getMetadata(
        MetadataKey.Validator,
        target.prototype,
        key
      );
      if (validatInputMetadata) {
        const validatorMW = validationMiddleware(validatInputMetadata.schema, validatInputMetadata.field);
        middlewares.push(validatorMW);
      }

      if (routePath) applicatonRouter.router[routeMethod](`${routePrefix}${routePath}`, ...middlewares, routeHandler);
    }
  };
}

//===============================
