import { Request, Response } from "express";
import { ForbidenError } from "../lib/errors/Forbiden";
import { NotFoundError } from "../lib/errors/NotFound";
import { studyMiddleware } from "../modules/study/services/study.mw";
import { ITokenPayload } from "../modules/user/services/passport.middleware";

export async function applyProxyRequestRouter(req: Request, res: Response) {
  console.log(req.path);

  // /studies
  if (req.path.match(/^\/studies\/?$/)) {
    if (req.method === "GET") {
      if ((<ITokenPayload>req.user).role !== "Admin")
        throw new ForbidenError("access denied");
      return;
    }
  }

  // /studies/{id}
  if (req.path.match(/^\/studies\/.+\/?$/)) {
    if (req.method === "DELETE")
      return studyMiddleware.beforeClearStudies(req, res);
  }

  // /instances
  if (req.path.match(/^\/instances\/?$/)) {
    if (req.method === "POST") return studyMiddleware.beforeUpload(req, res);
  }
  //
  else throw new NotFoundError("proxy route not found");
}

export async function applyProxyResponseRouter(
  proxyRes: any,
  req: any,
  res: any
) {
  console.log(req.path);

  // /studies
  // if (req.path.match(/^\/studies\/?$/)) {
  //   if (req.method === "GET") {
  //     if ((<ITokenPayload>req.user).role !== "Admin")
  //       throw new ForbidenError("access denied");
  //     return;
  //   }
  // }

  // // /studies/{id}
  // if (req.path.match(/^\/studies\/.+\/?$/)) {
  //   if (req.method === "DELETE")
  //     return studyMiddleware.beforeClearStudies(req, res);
  // }

  // /instances
  if (req.path.match(/^\/instances\/?$/)) {
    if (req.method === "POST")
      return studyMiddleware.afterUpload(proxyRes, req, res);
  }
  //
  // else throw new NotFoundError("proxy route not found");
}
