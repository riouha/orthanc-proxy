import { dbConnection } from "../../../app/db/db";
import { userService } from "../../user/services/user.service";
import { Study } from "../entities/study.entity";
import { ITokenPayload } from "../../user/services/passport.middleware";
import { BadRequestError } from "../../../lib/errors/BadRequest";
import axios from "axios";
import { applicationConfigs } from "../../../config/config";
import { NotFoundError } from "../../../lib/errors/NotFound";
import { ForbidenError } from "../../../lib/errors/Forbiden";

class StudyService {
  private studyRepo = dbConnection.datasource.getRepository(Study);

  async getStudyById(id: number, relations: string[] = []) {
    const study = await this.studyRepo.findOne({ where: { id }, relations });
    if (!study) throw new NotFoundError({ field: "study", id });
    return study;
  }

  async addStudy(
    originalStudyID: string,
    studyID: string,
    studyInfo: any,
    statResult: any,
    userId: number
  ) {
    const study = new Study();
    study.orthanc_originalId = originalStudyID;
    study.orthac_id = studyID;
    study.orthac_patientId = studyInfo.ParentPatient;
    study.mainTags = studyInfo.MainDicomTags;
    study.patientTags = studyInfo.PatientMainDicomTags;
    study.orthanc_series = studyInfo.Series;
    study.size = +statResult.DiskSize;
    study.userId = userId;
    return this.studyRepo.save(study);
  }

  async clearStudies() {}

  async hasAccessOnStudy(token: ITokenPayload, study: Study) {
    if (token.role !== "Admin") {
      if (study.userId !== token.id) return false;
    }
    return true;
  }
  //#region  orthanc
  async uploadAndAnonymizeStudy(
    files: Express.Multer.File[],
    token: ITokenPayload
  ) {
    const filesSize = files.reduce((acc, x) => (acc += x.size), 0);
    const user = await userService.getUser(token.id);
    if (user.totalSpace < user.usedSpace + filesSize)
      throw new BadRequestError("not enough space");

    const uploadResults = await Promise.all(
      files.map((multerFile) =>
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

    return Promise.all(
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
          applicationConfigs.orthanc.url + `/studies/${anonynizeResult.data.ID}`
        );
        const studyStats = await axios.get(
          applicationConfigs.orthanc.url +
            `/studies/${anonynizeResult.data.ID}/statistics`
        );

        return studySevice.addStudy(
          originalStudyID,
          anonynizeResult.data.ID,
          studyInfo.data,
          studyStats.data,
          user.id
        );
      })
    );
  }

  async previewStudyInstance(studyId: number, token: ITokenPayload) {
    const study = await this.getStudyById(studyId, ["subscribers"]);
    const hasAccess = this.hasAccessOnStudy(token, study);
    if (!hasAccess) throw new ForbidenError("access denied");

    const getStudyInstances = await axios.get(
      applicationConfigs.orthanc.url + `/studies/${study.orthac_id}/instances`
    );
    return axios.get(
      applicationConfigs.orthanc.url +
        `/instances/${getStudyInstances.data[0].ID}/preview`,
      { responseType: "stream" }
    );
  }
  //#endregion
}

export const studySevice = new StudyService();
