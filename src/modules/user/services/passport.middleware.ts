import { Request, Response, NextFunction } from "express";
import passport from "passport";
import PassportLocal from "passport-local";
import PassportJWT from "passport-jwt";
import PassportGoogle from "passport-google-oauth20";
import jwt from "jsonwebtoken";
import { userService } from "./user.service";
import { UnAuthorizedError } from "../../../lib/errors/UnAuthorized";
import { User, UserRole } from "../entities/user.entity";
import { ForbidenError } from "../../../lib/errors/Forbiden";

class PassportService {
  initialize() {
    passport.use(
      "signup",
      new PassportLocal.Strategy(
        {
          usernameField: "email",
          passwordField: "password",
          passReqToCallback: true,
          session: false,
        },
        async (req, email, password, cb) => {
          try {
            const result = await userService.signupUser({
              email,
              password,
              firstName: req.body.firstName,
              lastName: req.body.lastName,
              country: req.body.country,
            });
            return cb(null, result);
          } catch (err) {
            return cb(err, null);
          }
        }
      )
    );

    passport.use(
      "login",
      new PassportLocal.Strategy(
        {
          usernameField: "email",
          passwordField: "password",
          passReqToCallback: true,
          session: false,
        },
        async (_req, email, password, cb) => {
          try {
            const user: User = await userService.loginUser(email, password);
            return cb(null, user);
          } catch (err: any) {
            return cb(err.message, false);
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
        async (token: ITokenPayload, done) => {
          try {
            return done(null, token);
          } catch (error) {
            done(error);
          }
        }
      )
    );

    passport.use(
      "google",
      new PassportGoogle.Strategy(
        {
          // clientID:
          //   "1054853936890-s6fg36qji71ptgks04s5eb14baobs8aa.apps.googleusercontent.com",
          // clientSecret: "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",
          // callbackURL: "https://testapi.maskan13.ir/auth/callback",
          clientID: process.env.GOOGLE_CLIENTID,
          clientSecret: process.env.GOOGLE_SECRET,
          callbackURL: "http://localhost:4000/user/auth/google-callback",
        },
        (accessToken: any, refreshToken: any, profile: any, cb: any) => {
          console.log("in middlware", accessToken, refreshToken, profile, cb);
        }
      )
    );
  }

  guard(role: UserRole, isActive = true) {
    return (req: Request, res: Response, next: NextFunction) => {
      passport.authenticate("jwt", { session: false }, (err, user) => {
        // use jwt middleware
        if (err) return next(err);
        if (!user)
          throw new UnAuthorizedError("invalid token, please login or signup");

        // verify access
        if (isActive && !user?.isActive)
          throw new ForbidenError("access denied.");
        const obj: { [key: string]: UserRole[] } = {
          User: ["User"],
          Admin: ["User", "Admin"],
        };
        if (!obj[user?.role].includes(role))
          throw new ForbidenError("access denied.");
        //

        req.user = user;
        return next();
      })(req, res, next);
    };
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
  email: string;
  role: UserRole;
  isActive: boolean;
}
