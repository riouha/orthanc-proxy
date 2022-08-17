import { Request, Response, NextFunction } from "express";
import { Controller } from "../../../lib/decorators/controller.decorator";
import {
  Delete,
  Get,
  Post,
  Put,
} from "../../../lib/decorators/methods.decorator";
import { IResponse } from "../../../lib/responses/IResponse";
import { validateInput } from "../../../lib/decorators/valdation.decorators";
import { Use } from "../../../lib/decorators/middlewae.decorator";
import { passportService } from "../../user/services/passport.middleware";
import axios from "axios";
import { applicationConfigs } from "../../../config/config";
import { userService } from "../../user/services/user.service";
import {
  uploadFileInMemory,
  uploadManyInMemory,
} from "../../../middlewares/file-upload.middleware";
import { BadRequestError } from "../../../lib/errors/BadRequest";
import { Study } from "../entities/study.entity";
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
      const filesSize = req.files.reduce((acc, x) => (acc += x.size), 0);
      const user = await userService.getUser(req.user.id);
      if (user.totalSpace < user.usedSpace + filesSize)
        throw new BadRequestError("not enough space");

      const uploadResults = await Promise.all(
        req.files.map((multerFile) =>
          axios.post(
            applicationConfigs.orthanc.url + "/instances",
            multerFile.buffer
          )
        )
      );

      const studySet = new Set(
        uploadResults
          .map((x) => x.data)
          .flat()
          .map((x) => x.ParentStudy)
      );
      console.log(studySet);

      const studies = await Promise.all(
        Array.from(studySet).map(async (originalStudyID) => {
          const anonynizeResult = await axios.post(
            applicationConfigs.orthanc.url +
              `/studies/${originalStudyID}/anonymize`,
            {
              Keep: [
                "PatientName",
                "PatientSex",
                "SeriesDescription",
                "StudyDescription",
              ],
              KeepPrivateTags: true,
              KeepSource: false,
            }
          );

          const studyInfo = await axios.get(
            applicationConfigs.orthanc.url +
              `/studies/${anonynizeResult.data.ID}`
          );
          const studyStats = await axios.get(
            applicationConfigs.orthanc.url +
              `/studies/${anonynizeResult.data.ID}/statistics`
          );

          return studySevice.addStudy(
            originalStudyID,
            anonynizeResult.data.ID,
            studyInfo.data,
            studyStats.data
          );
        })
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
}
export default new StudyController();
