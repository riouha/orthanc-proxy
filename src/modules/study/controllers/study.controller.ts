import { Request, Response, NextFunction } from "express";
import { Controller } from "../../../lib/decorators/controller.decorator";
import { Delete, Get, Post } from "../../../lib/decorators/methods.decorator";
import { IResponse } from "../../../lib/responses/IResponse";
import { Use } from "../../../lib/decorators/middlewae.decorator";
import {
  passportService,
  ITokenPayload,
} from "../../user/services/passport.middleware";
import axios from "axios";
import { applicationConfigs } from "../../../config/config";
import { uploadManyInMemory } from "../../../middlewares/file-upload.middleware";
import { BadRequestError } from "../../../lib/errors/BadRequest";
import { studySevice } from "../services/study.service";

@Controller("/study")
class StudyController {
  // @validateInput(SpaceSettingSchema)
  // @Use(passportService.guard("Admin"))
  // @Delete("/bulk/:ids")
  // async modifyUserSpace(req: Request, res: Response, next: NextFunction) {
  //   try {
  //     const result = await userService.modifyUserSpace(req.body);
  //     return res.json(<IResponse>{ hasError: false, data: { result } });
  //   } catch (error) {
  //     next(error);
  //   }
  // }
  @Use(passportService.guard("Admin"))
  @Delete("/clear")
  async clearAllStudies(_req: Request, res: Response, next: NextFunction) {
    try {
      const getStudiesResult = await axios.get(
        applicationConfigs.orthanc.url + "/studies"
      );
      const result = await axios.post(
        applicationConfigs.orthanc.url + "/tools/bulk-delete",
        {
          Resources: getStudiesResult.data,
        }
      );
      return res.json(<IResponse>{ hasError: false, data: result.data });
    } catch (error) {
      next(error);
    }
  }

  @Use(passportService.guard("User"))
  @Use(uploadManyInMemory)
  @Post("/upload")
  async uploadStudyFiles(req: any, res: Response, next: NextFunction) {
    try {
      const studies = await studySevice.uploadAndAnonymizeStudy(
        req.files,
        req.user
      );

      return res.json(<IResponse>{ hasError: false, data: { studies } });
    } catch (err: any) {
      if (err?.response?.status == 400)
        next(
          new BadRequestError(err?.response?.data?.Message, err?.response?.data)
        );
      else next(err);
    }
  }

  @Use(passportService.guard("User"))
  @Get("/:id/preview")
  async previewStudy(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await studySevice.previewStudyInstance(
        +req.params.id,
        req.user as ITokenPayload
      );
      return result.data.pipe(res);
    } catch (error) {
      next(error);
    }
  }
}
export default new StudyController();
