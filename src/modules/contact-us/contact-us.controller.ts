import { Request, Response, NextFunction } from "express";
import { Controller } from "../../lib/decorators/controller.decorator";
import { Get, Post } from "../../lib/decorators/methods.decorator";
import { Use } from "../../lib/decorators/middlewae.decorator";
import { ValidateInput } from "../../lib/decorators/valdation.decorators";
import { IResponse } from "../../lib/responses/IResponse";
import { passportService } from "../user/services/passport.middleware";
import { SearchSchema, ContactUsSchema } from "./dtos/contact-us.dto";
import { contactusSevice } from "./services/contact-us.service";

@Controller("/contactus")
class ContactUsController {
  @ValidateInput(ContactUsSchema)
  @Post("/")
  async addContactUs(req: Request, res: Response, next: NextFunction) {
    try {
      const message = await contactusSevice.addContactUs(req.body);
      return res.json(<IResponse>{ hasError: false, data: { message } });
    } catch (error) {
      next(error);
    }
  }

  @Use(passportService.guard("Admin"))
  @ValidateInput(SearchSchema, "QUERY")
  @Get("/")
  async searchContactUs(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await contactusSevice.searchContactUs(req.query);
      return res.json(<IResponse>{ hasError: false, data: result });
    } catch (error) {
      next(error);
    }
  }
}
export default new ContactUsController();
