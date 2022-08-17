import { Request, Response, NextFunction } from "express";
import { Controller } from "../../../lib/decorators/controller.decorator";
import { Put } from "../../../lib/decorators/methods.decorator";
import { userService } from "../services/user.service";
import { IResponse } from "../../../lib/responses/IResponse";
import { ValidateInput } from "../../../lib/decorators/valdation.decorators";
import { passportService } from "../services/passport.middleware";
import { SpaceSettingSchema } from "../dto/setting.dto";
import { Use } from "../../../lib/decorators/middlewae.decorator";

@Controller("/setting")
class SettingController {
  @ValidateInput(SpaceSettingSchema)
  @Use(passportService.guard("Admin"))
  @Put("/space")
  async modifyUserSpace(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await userService.modifyUserSpace(req.body);
      return res.json(<IResponse>{ hasError: false, data: { result } });
    } catch (error) {
      next(error);
    }
  }
}
export default new SettingController();
