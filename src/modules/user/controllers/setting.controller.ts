import { Request, Response, NextFunction } from "express";
import passport from "passport";
import { Controller } from "../../../lib/decorators/controller.decorator";
import { Get, Post } from "../../../lib/decorators/methods.decorator";
import { userService } from "../services/user.service";
import { IResponse } from "../../../lib/responses/IResponse";
import { validateInput } from "../../../lib/decorators/valdation.decorators";
import {
  ForgetPassword,
  LoginSchema,
  SignupSchema,
  VerifySchema,
} from "../validations/user.validation";
import { BadRequestError } from "../../../lib/errors/BadRequest";
import { User } from "../entities/user.entity";
import { passportService } from "../services/passport.middleware";
import { UnAuthorizedError } from "../../../lib/errors/UnAuthorized";
import { Use } from "../../../lib/decorators/middlewae.decorator";
import { ChangePassword } from "../validations/user.validation";

@Controller("/")
class SettingController {
  @validateInput(SignupSchema)
  @Use(passportService.guard("Admin"))
  @Get("/")
  async getUsers(req: Request, res: Response, next: NextFunction) {
    try {
      const users = await userService.getUers();
      return res.json(<IResponse>{ hasError: false, data: { users } });
    } catch (error) {
      next(error);
    }
  }
}
export default new SettingController();
