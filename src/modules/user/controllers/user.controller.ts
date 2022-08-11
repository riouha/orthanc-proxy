import { Request, Response, NextFunction } from "express";
import { Controller } from "../../../lib/decorators/controller.decorator";
import { Get } from "../../../lib/decorators/methods.decorator";

@Controller("/user")
class UserController {
  @Get("/")
  async getUsers(req: Request, res: Response, next: NextFunction) {
    try {
      return res.json({ test: "ok" });
    } catch (error) {
      next(error);
    }
  }
}
export default new UserController();
