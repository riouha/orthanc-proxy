import { Request, Response, NextFunction } from "express";
import { Controller } from "../../../lib/decorators/controller.decorator";
import { Delete, Get, Patch, Post } from "../../../lib/decorators/methods.decorator";
import { IResponse } from "../../../lib/responses/IResponse";
import { Use } from "../../../lib/decorators/middlewae.decorator";
import { passportService, ITokenPayload } from "../../user/services/passport.middleware";
import axios from "axios";
import { applicationConfigs } from "../../../config/config";
import { uploadManyInMemory } from "../../../middlewares/file-upload.middleware";
import { BadRequestError } from "../../../lib/errors/BadRequest";
import { studySevice } from "../services/study.service";
import { ValidateInput } from "../../../lib/decorators/valdation.decorators";
import { DeleteStudiesSchema, EditStudySchema, SerachStudySchema } from "../dtos/study.dto";

@Controller("/study")
class StudyController {
  // @Use(passportService.guard("Admin"))
  // @Delete("/clear")
  // async clearAllStudies(_req: Request, res: Response, next: NextFunction) {
  //   try {
  //     const getStudiesResult = await axios.get(applicationConfigs.orthanc.url + "/studies");
  //     const result = await axios.post(applicationConfigs.orthanc.url + "/tools/bulk-delete", {
  //       Resources: getStudiesResult.data,
  //     });
  //     return res.json(<IResponse>{ hasError: false, data: result.data });
  //   } catch (error) {
  //     next(error);
  //   }
  // }

  @Use(passportService.guard("User"))
  @Use(uploadManyInMemory)
  @Post("/upload")
  async uploadStudyFiles(req: any, res: Response, next: NextFunction) {
    try {
      const studies = await studySevice.uploadAndAnonymizeStudy(req.files, req.user, req.body);

      return res.json(<IResponse>{ hasError: false, data: { studies } });
    } catch (err: any) {
      if (err?.response?.status == 400) next(new BadRequestError(err?.response?.data?.Message, err?.response?.data));
      else next(err);
    }
  }

  @Use(passportService.guard("User"))
  @Get("/:id/preview")
  async previewStudy(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await studySevice.previewStudyInstance(+req.params.id, req.user as ITokenPayload);
      return result.data.pipe(res);
    } catch (error) {
      next(error);
    }
  }

  @Use(passportService.guard("User"))
  @ValidateInput(EditStudySchema, "BODY")
  @Patch("/:id")
  async editStudy(req: Request, res: Response, next: NextFunction) {
    try {
      const study = await studySevice.editStudy(+req.params.id, req.body, (<ITokenPayload>req.user).id);
      return res.json(<IResponse>{ hasError: false, data: { study } });
    } catch (error) {
      next(error);
    }
  }

  @Use(passportService.guard("User"))
  @ValidateInput(SerachStudySchema, "QUERY")
  @Get("/me")
  async searchMyStudies(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await studySevice.searchStudy(req.query, (<ITokenPayload>req.user).id);
      return res.json(<IResponse>{ hasError: false, data: result });
    } catch (error) {
      next(error);
    }
  }

  @Use(passportService.guard("User"))
  @Get("/:id")
  async getStudy(req: Request, res: Response, next: NextFunction) {
    try {
      const study = await studySevice.getStudyInfo(+req.params.id, <ITokenPayload>req.user);
      return res.json(<IResponse>{ hasError: false, data: { study } });
    } catch (error) {
      next(error);
    }
  }

  @Use(passportService.guard("User"))
  @ValidateInput(DeleteStudiesSchema, "QUERY")
  @Delete("/")
  async deleteStudies(req: Request, res: Response, next: NextFunction) {
    try {
      const study = await studySevice.deleteStudies(
        (<string[]>req.query.ids).map((x) => +x),
        (<ITokenPayload>req.user).id
      );
      return res.json(<IResponse>{ hasError: false, data: { study } });
    } catch (error) {
      next(error);
    }
  }

  @Use(passportService.guard("Admin"))
  @ValidateInput(SerachStudySchema, "QUERY")
  @Get("/")
  async searchStudies(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await studySevice.searchStudy(req.query);
      return res.json(<IResponse>{ hasError: false, data: result });
    } catch (error) {
      next(error);
    }
  }
}
export default new StudyController();
