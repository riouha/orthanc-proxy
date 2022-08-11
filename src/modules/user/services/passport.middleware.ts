import { Request, Response, NextFunction } from "express";
import passport from "passport";
import PassportLocal from "passport-local";
import PassportJWT from "passport-jwt";
import jwt from "jsonwebtoken";
import { userService } from "./user.service";
import { UnAuthorizedError } from "../../../lib/errors/UnAuthorized";

class PassportService {
  initialize() {
    passport.use(
      "signup",
      new PassportLocal.Strategy(
        { usernameField: "username", passwordField: "password", passReqToCallback: true, session: false },
        async (req, username, password, cb) => {
          try {
            const user = await userService.signupUser(username, req.body.email, password);
            return cb(null, user);
          } catch (err) {
            return cb(err, null);
          }
        }
      )
    );

    passport.use(
      "login",
      new PassportLocal.Strategy(
        { usernameField: "username", passwordField: "password", passReqToCallback: true, session: false },
        async (_req, username, password, cb) => {
          try {
            const user = await userService.loginUser(username, password);
            const token = this.generateToken({
              id: user.id,
              username: user.username,
              email: user.email,
              isActive: user.isActive,
            });
            return cb(null, { user, token });
          } catch (err: any) {
            return cb(err, false);
          }
        }
      )
    );

    passport.use(
      "jwt",
      new PassportJWT.Strategy(
        {
          secretOrKey: process.env.JWT_SECRET,
          jwtFromRequest: PassportJWT.ExtractJwt.fromAuthHeaderAsBearerToken(),
        },
        async (token, done) => {
          try {
            return done(null, token);
          } catch (error) {
            done(error);
          }
        }
      )
    );
  }

  guard(req: Request, res: Response, next: NextFunction) {
    passport.authenticate("jwt", { session: false }, (err, user) => {
      // use jwt middleware
      if (err) return next(err);
      if (!user) throw new UnAuthorizedError("invalid token, please login or signup");
      req.user = user;
      return next();
    })(req, res, next);
  }

  generateToken(data: ITokenPayload) {
    return jwt.sign(data, process.env.JWT_SECRET, {
      expiresIn: "365d",
      //algorithm: "RS256",
    });
  }
}

export const passportService = new PassportService();

export interface ITokenPayload {
  id: number;
  username: string;
  email: string;
  isActive: boolean;
}
