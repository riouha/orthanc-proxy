import { Request, Response, NextFunction } from "express";
import { BadGatewayError } from "../lib/errors/BadGateway";
import { BadRequestError } from "../lib/errors/BadRequest";
import { ConflictError } from "../lib/errors/Conflict";
import { CustomError } from "../lib/errors/CustomError";
import { ForbidenError } from "../lib/errors/Forbiden";
import { InternalServerError } from "../lib/errors/InternalServer";
import { NotAllowedError } from "../lib/errors/NotAllowed";
import { NotFoundError } from "../lib/errors/NotFound";
import { PaymentRequiredError } from "../lib/errors/PaymentRequired";
import { UnAuthorizedError } from "../lib/errors/UnAuthorized";
import { IResponse } from "../lib/responses/IResponse";
import { Result } from "../lib/responses/Result";
//================================================

export const errorHandlerMiddleware =
  (logger: any) => (err: Error, req: Request, res: Response, next: NextFunction) => {
    if (!err) return next();

    if (err instanceof SyntaxError)
      return res.status(400).json(<IResponse>{
        hasError: true,
        message: "Invalid Input: SyntaxError",
        data: null,
      });

    if (err instanceof BadRequestError)
      return res.status(err.statusCode).json(<IResponse>{
        hasError: true,
        message: err.message ?? "BadRequestError",
        data: err.data ?? null,
      });

    if (err instanceof UnAuthorizedError)
      return res.status(err.statusCode).json(<IResponse>{
        hasError: true,
        message: err.message ?? "UnAuthorizedError",
        data: null,
      });

    if (err instanceof BadGatewayError)
      return res.status(err.statusCode).json(<IResponse>{
        hasError: true,
        message: err.message ?? "BadGatewayError",
        data: err.data ?? null,
      });

    if (err instanceof NotFoundError)
      return res.status(err.statusCode).json(<IResponse>{
        hasError: true,
        message: err.message ?? "NotFoundError",
        data: err.data ?? null,
      });

    if (err instanceof ForbidenError)
      return res.status(err.statusCode).json(<IResponse>{
        hasError: true,
        message: err.message ?? "ForbidenError",
        data: err.data ?? null,
      });

    if (err instanceof NotAllowedError)
      return res.status(err.statusCode).json(<IResponse>{
        hasError: true,
        message: err.message ?? "NotAllowedError",
        data: err.data ?? null,
      });

    if (err instanceof PaymentRequiredError)
      return res.status(err.statusCode).json(<IResponse>{
        hasError: true,
        message: err.message ?? "PaymentRequiredError",
        data: err.data ?? null,
      });

    if (err instanceof ConflictError)
      return res.status(err.statusCode).json(<IResponse>{
        hasError: true,
        message: err.message ?? "ConflictError",
        data: err.data ?? null,
      });

    if (err instanceof InternalServerError)
      return res.status(err.statusCode).json(<IResponse>{
        hasError: true,
        message: err.message ?? "InternalServerError",
        data: err.data ?? null,
      });

    if (err instanceof CustomError)
      return res.status(err.statusCode).json(<IResponse>{
        hasError: true,
        message: err.message ?? "Error",
        data: err.data ?? null,
      });
    if (err instanceof Result) return res.status(err.status).json(err.response);

    //ELSE
    logger.info("Internal Server Error", { body: req.body, params: req.params, query: req.query, headers: res.locals });
    logger.error(err.message, err);
    return res.status(500).json(<IResponse>{
      hasError: true,
      message: "Internal Server Error",
      data: err.message ?? null,
    });
  };
