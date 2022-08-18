import { Server } from "http";
import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import { applicationConfigs } from "../config/config";
import { dbConnection } from "./db/db";
import { errorHandlerMiddleware } from "../middlewares/error-handler.middleware";
import { applicatonRouter } from "./app.router";
import "./app.controller";
import { createProxyMiddleware, fixRequestBody } from "http-proxy-middleware";
import { passportService } from "../modules/user/services/passport.middleware";
import { studyMiddleware } from "../modules/study/services/study.mw";
import { applyProxyRequestRouter, applyProxyResponseRouter } from "./proxy.routes";

//===============================================================

export default class Application {
  public server: Server;
  public app: express.Express;
  constructor() {
    dbConnection
      .initialize()
      .then(() => this.configServer())
      .catch((err) => console.error(err.message, err));
  }
  //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
  configServer() {
    this.app = express();
    // # middlewares
    this.app.use(cors());
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));

    // # application routes
    this.app.use(
      "/orthanc",
      // passportService.authenticate,
      createProxyMiddleware({
        // selfHandleResponse: true,
        target: applicationConfigs.orthanc.url,
        //"http://127.0.0.1:8042"
        pathRewrite: { "^/orthanc": "" },
        changeOrigin: true,

        //#region req
        onProxyReq: async (proxyReq, req, res, opt) => {
          // try {
          //   console.info(
          //     `route ${req.headers.host + req.originalUrl} ==> ${
          //       proxyReq.getHeaders().host + req.url
          //     }`
          //   );
          //   await applyProxyRequestRouter(req, res);
          //   if (req.body) fixRequestBody(proxyReq, req);
          // } catch (error: any) {
          //   errorHandlerMiddleware(console)(error, req, res, undefined);
          // }
        },
        //#endregion

        onProxyRes: async (proxyRes, req, res) => {
          // try {
          //   console.info(
          //     `get Response from ${proxyRes.socket.remoteAddress}:${
          //       proxyRes.socket.remotePort + req.url
          //     } ==> ${req.headers.host + req.originalUrl}`
          //   );
          //   console.log(proxyRes.statusCode);
          //   console.log(res.statusCode);
          //   await applyProxyResponseRouter(proxyRes, req, res);
          // } catch (error: any) {
          //   errorHandlerMiddleware(console)(error, req, res, undefined);
          // }
        },
        // onProxyRes: responseInterceptor(
        //   async (responseBuffer, proxyRes, req, res) => {
        //     return "dddddddddddd";
        //   }
        // ),
        onError: (err: any, req: any, res: any) => {
          console.error(err);
        },
      })
    );

    this.app.use(
      "/",
      (req: Request, _res: Response, next: NextFunction) => {
        console.info("#new request: req.url", req.url);
        next();
      },
      applicatonRouter.router
    );

    // # error handler
    this.app.use(errorHandlerMiddleware(console));

    // # application setup
    const port = applicationConfigs.app.port || 4000;
    this.server = this.app.listen(port, () => console.log(`listening to port ${port} .............................`));
  }
}
