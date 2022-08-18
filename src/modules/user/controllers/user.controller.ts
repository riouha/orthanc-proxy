import { Request, Response, NextFunction } from "express";
import passport from "passport";
import { Controller } from "../../../lib/decorators/controller.decorator";
import { Get, Post } from "../../../lib/decorators/methods.decorator";
import { userService } from "../services/user.service";
import { IResponse } from "../../../lib/responses/IResponse";
import { ValidateInput } from "../../../lib/decorators/valdation.decorators";
import {
  ForgetPasswordSchema,
  LoginSchema,
  SignupSchema,
  VerifySchema,
  ChangePasswordSchema,
  SetNewPasswordSchema,
} from "../dto/user.validation";
import { BadRequestError } from "../../../lib/errors/BadRequest";
import { User } from "../entities/user.entity";
import { ITokenPayload, passportService } from "../services/passport.middleware";
import { UnAuthorizedError } from "../../../lib/errors/UnAuthorized";
import { Use } from "../../../lib/decorators/middlewae.decorator";
import { SerachUsersSchema } from "../dto/user.validation";

@Controller("/user")
class UserController {
  constructor() {
    // initialize passport middlewares
    passportService.initialize();
  }

  @Get("/auth/google-callback")
  async googleAuthCallback(req: Request, res: Response, next: NextFunction) {
    passport.authenticate("google", { failureRedirect: "/user/login" }, (req, res) => {
      try {
        console.log("in controller", req, res);
      } catch (err) {
        next(err);
      }
    })(req, res, next);
  }

  @Get("/auth/google")
  async googleAuth(req: Request, res: Response, next: NextFunction) {
    passport.authenticate("google", { session: false, scope: ["profile", "email"] }, (error, data: any) => {
      try {
        console.log("in controller", error, data);
      } catch (err) {
        next(err);
      }
    })(req, res, next);
  }

  @ValidateInput(VerifySchema, "PARAMS")
  @Get("/:email/verify/:hash")
  async verifyUser(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await userService.varifyUser(req.params.email, req.params.hash);
      delete user.password;
      return res.json(<IResponse>{ hasError: false, data: { user } });
    } catch (err) {
      next(err);
    }
  }

  @ValidateInput(ForgetPasswordSchema)
  @Post("/forget-password")
  async forgetPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const hash = await userService.forgetPassword(req.body.email);
      return res.json(<IResponse>{ hasError: false, data: { hash } });
    } catch (err) {
      next(err);
    }
  }

  @ValidateInput(SetNewPasswordSchema)
  @Post("/set-new-password")
  async setNewPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await userService.setNewPassword(req.body.email, req.body.hash, req.body.newPassword);
      delete user.password;
      return res.json(<IResponse>{ hasError: false, data: { user } });
    } catch (err) {
      next(err);
    }
  }

  @Use(passportService.guard("User"))
  @ValidateInput(ChangePasswordSchema)
  @Post("/change-password")
  async changePassword(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await userService.chnagePassword(
        (<ITokenPayload>req.user).id,
        req.body.oldPassword,
        req.body.newPassword
      );
      delete user.password;
      return res.json(<IResponse>{ hasError: false, data: { user } });
    } catch (err) {
      next(err);
    }
  }

  @ValidateInput(SignupSchema)
  @Post("/signup")
  async signupUser(req: Request, res: Response, next: NextFunction) {
    // first passport signup middleware will called. then cb will invoke
    passport.authenticate("signup", { session: false }, async (error, data: { user: User; hash: string }) => {
      try {
        if (error) throw error;
        if (!data) throw new BadRequestError("invalid credentials");
        delete data.user.password;
        return res.status(201).json(<IResponse>{ hasError: false, data });
      } catch (error) {
        next(error);
      }
    })(req, res, next);
  }

  @ValidateInput(LoginSchema)
  @Post("/login")
  async loginUser(req: Request, res: Response, next: NextFunction) {
    passport.authenticate("login", { session: false }, (error, user: User) => {
      try {
        if (error || !user) throw new UnAuthorizedError(error);
        const token = passportService.generateToken({
          id: user.id,
          email: user.email,
          isActive: user.isActive,
          role: user.role,
        });
        delete user.password;
        return res.json(<IResponse>{ hasError: false, data: { user, token } });
      } catch (err) {
        next(err);
      }
    })(req, res, next);
  }

  @Use(passportService.guard("User"))
  @ValidateInput(SerachUsersSchema, "QUERY")
  @Get("/search")
  async searchUsres(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await userService.searchUsres(req.query);
      return res.json(<IResponse>{ hasError: false, data: result });
    } catch (error) {
      next(error);
    }
  }

  @Use(passportService.guard("Admin"))
  @Get("/")
  async getAllUsers(req: Request, res: Response, next: NextFunction) {
    try {
      const users = await userService.getAllUsers();
      return res.json(<IResponse>{ hasError: false, data: { users } });
    } catch (error) {
      next(error);
    }
  }
}
export default new UserController();
