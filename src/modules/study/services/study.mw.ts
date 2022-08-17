import { Request, Response } from "express";
import { BadRequestError } from "../../../lib/errors/BadRequest";
import { ForbidenError } from "../../../lib/errors/Forbiden";
import { ITokenPayload } from "../../user/services/passport.middleware";
import { userService } from "../../user/services/user.service";

class StudyMiddleware {
  async beforeClearStudies(req: Request, res: Response) {
    if ((<ITokenPayload>req.user).role !== "User")
      throw new ForbidenError("access denied");
  }

  async beforeUploadInstance() {}

  async beforeUpload(req: Request, res: Response) {
    const user = await userService.getUser((<ITokenPayload>req.user).id);
    if (user.totalSpace < user.usedSpace)
      throw new BadRequestError("not enough space");
  }

  async afterUpload(proxyRes: any, req: Request, res: Response) {
    console.log(proxyRes);

    // const user = await userService.getUser((<ITokenPayload>req.user).id);
    // if (user.totalSpace < user.usedSpace)
    //   throw new BadRequestError("not enough space");
  }
}

export const studyMiddleware = new StudyMiddleware();
