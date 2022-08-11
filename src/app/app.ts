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
      "/test",
      passportService.guard,
      createProxyMiddleware({
        target: "http://localhost:3000",
        pathRewrite: { "^/test": "" },
        changeOrigin: true,
        onProxyReq: (proxyReq, req, res, opt) => {
          console.log(`Route ` + req.headers.host + req.originalUrl + " to " + proxyReq.getHeaders().host + req.url);
          console.log(req.body, req.params, req.query);
          console.log(req.user);
          if (req.body) fixRequestBody(proxyReq, req);
        },
        onProxyRes: (proxyRes, req, res) => {
          console.info(
            `get Response from ` +
              proxyRes.socket.remoteAddress +
              ":" +
              proxyRes.socket.remotePort +
              req.url +
              " to " +
              req.headers.host +
              req.originalUrl
          );
          console.log(proxyRes.statusCode);
          console.log(res.statusCode);
        },
        onError: (err: any, req: any, res: any) => {
          console.error(err.message);
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
