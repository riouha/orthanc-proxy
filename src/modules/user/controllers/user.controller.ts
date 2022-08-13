import { Request, Response, NextFunction } from "express";
import passport from "passport";
import { Controller } from "../../../lib/decorators/controller.decorator";
import { Get, Post } from "../../../lib/decorators/methods.decorator";
import { userService } from "../services/user.service";
import { IResponse } from "../../../lib/responses/IResponse";
import { validateInput } from "../../../lib/decorators/valdation.decorators";
import { LoginSchema, SignupSchema } from "../validations/user.validation";
import { BadRequestError } from "../../../lib/errors/BadRequest";
import { User } from "../entities/user.entity";
import { passportService } from "../services/passport.middleware";
import { UnAuthorizedError } from "../../../lib/errors/UnAuthorized";
import { Use } from "../../../lib/decorators/middlewae.decorator";

@Controller("/user")
class UserController {
  constructor() {
    // initialize passport middlewares
    passportService.initialize();
  }

  @Get("/auth/google-callback")
  async googleAuthCallback(req: Request, res: Response, next: NextFunction) {
    passport.authenticate(
      "google",
      { failureRedirect: "/user/login" },
      (req, res) => {
        try {
          console.log("in controller", req, res);
        } catch (err) {
          next(err);
        }
      }
    )(req, res, next);
  }

  @Get("/auth/google")
  async googleAuth(req: Request, res: Response, next: NextFunction) {
    passport.authenticate(
      "google",
      { session: false, scope: ["profile", "email"] },
      (error, data: any) => {
        try {
          console.log("in controller", error, data);
        } catch (err) {
          next(err);
        }
      }
    )(req, res, next);
  }

  @Post("/signup")
  @validateInput(SignupSchema)
  async signupUser(req: Request, res: Response, next: NextFunction) {
    // first passport signup middleware will called. then cb will invoke
    passport.authenticate(
      "signup",
      { session: false },
      async (error, user: User) => {
        try {
          if (error) throw error;
          if (!user) throw new BadRequestError("invalid credentials");
          delete user.password;
          return res
            .status(201)
            .json(<IResponse>{ hasError: false, data: user });
        } catch (error) {
          next(error);
        }
      }
    )(req, res, next);
  }

  @Post("/login")
  @validateInput(LoginSchema)
  async loginUser(req: Request, res: Response, next: NextFunction) {
    passport.authenticate(
      "login",
      { session: false },
      (error, data: { user: User; token: string }) => {
        try {
          if (error || !data) throw new UnAuthorizedError(error);
          delete data.user.password;
          return res.status(200).json(<IResponse>{ hasError: false, data });
        } catch (err) {
          next(err);
        }
      }
    )(req, res, next);
  }

  @Use(passportService.guard)
  @Get("/")
  async getUsers(req: Request, res: Response, next: NextFunction) {
    try {
      const users = await userService.getUers();
      return res.json(<IResponse>{ hasError: false, data: users });
    } catch (error) {
      next(error);
    }
  }
}
export default new UserController();
