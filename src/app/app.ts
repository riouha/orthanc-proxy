import { Server } from "http";
import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import { applicationConfigs } from "../config/config";
import { dbConnection } from "./db/db";
import { errorHandlerMiddleware } from "../middlewares/error-handler.middleware";
import { applicatonRouter } from "./app.router";
import "./app.controller";
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
