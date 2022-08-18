import { dbConnection } from "../../../app/db/db";
import { userService } from "../../user/services/user.service";
import { Study } from "../entities/study.entity";
import { ITokenPayload } from "../../user/services/passport.middleware";
import { BadRequestError } from "../../../lib/errors/BadRequest";
import axios from "axios";
import { applicationConfigs } from "../../../config/config";
import { NotFoundError } from "../../../lib/errors/NotFound";
import { ForbidenError } from "../../../lib/errors/Forbiden";
import { SearchStudyDto, EditStudyDto, StudyDto, AddStudyDto } from "../dtos/study.dto";
import { In } from "typeorm";

type AccessLevel = "Owner" | "Admin" | "Subscriber";
class StudyService {
  private studyRepo = dbConnection.datasource.getRepository(Study);

  async addStudy(dto: StudyDto, userId: number) {
    const study = new Study();
    study.description = dto.description;
    study.title = dto.title;
    study.orthac_id = dto.orthac_id;
    study.orthanc_originalId = dto.orthanc_originalId;
    study.orthac_patientId = dto.orthac_patientId;
    study.mainTags = dto.mainTags;
    study.patientTags = dto.patientTags;
    study.orthanc_series = dto.orthanc_series;
    study.orthanc_instances = dto.orthanc_instances;
    study.size = dto.size;
    study.userId = userId;
    return this.studyRepo.save(study);
  }

  async editStudy(id: number, dto: EditStudyDto, userId: number) {
    const study = await this.getStudyById(id);
    if (study.userId !== userId) throw new ForbidenError("access denied");

    if (dto.title) study.title = dto.title;
    if (dto.description) study.description = dto.description;
    if (dto.starred) study.starred = dto.starred;

    return this.studyRepo.save(study);
  }

  async getStudyById(id: number, relations: string[] = []) {
    const study = await this.studyRepo.findOne({ where: { id }, relations });
    if (!study) throw new NotFoundError({ field: "study", id });
    return study;
  }

  async getStudyInfo(id: number, token: ITokenPayload) {
    const study = await this.getStudyById(id, ["subscribers"]);
    const hasAccess = this.getAccessLevelOnStudy(token, study);
    if (!hasAccess) throw new ForbidenError("access denied");
    study.subscribers.forEach((subscriber) => delete subscriber.password);
    if (hasAccess === "Subscriber") delete study.subscribers;
    return study;
  }

  async searchStudy(filters: SearchStudyDto, userId?: number) {
    const query = this.studyRepo
      .createQueryBuilder("study")
      .orderBy("study.starred", "ASC")
      .addOrderBy("study.createDate", "DESC");

    if (filters.published) {
      query.innerJoin("study.subscribers", "subscribers");
      if (userId) query.where("study.userId= :userId", { userId });
    } else if (userId && filters.subscribed) {
      query.leftJoin("study.subscribers", "subscribers").where("subscribers.id= :userId", { userId });
    } else if (userId) query.where("study.userId= :userId", { userId });

    if (filters.limit) query.limit(+filters.limit);
    if (filters.offset) query.offset(+filters.offset);
    if (filters.title) query.andWhere("study.title LIKE :title", { title: `%${filters.title}%` });

    const [studies, count] = await query.getManyAndCount();
    return { studies, count };
  }

  async shareStudy(id: number, userId: number) {}

  async deleteStudies(ids: number[], userId: number) {
    const studies = await this.studyRepo.find({ where: { id: In(ids), userId } });
    if (studies.length) {
      await axios.post(applicationConfigs.orthanc.url + "/tools/bulk-delete", {
        Resources: studies.map((x) => x.orthac_id),
      });
      const user = await userService.userRepo.findOne({ where: { id: userId } });
      user.usedSpace = +user.usedSpace - +studies.reduce((acc, x) => (acc += +x.size), 0);
      await userService.userRepo.save(user);
      return this.studyRepo.remove(studies);
    }

    throw new NotFoundError("studies not found");
  }

  getAccessLevelOnStudy(token: ITokenPayload, study: Study): AccessLevel {
    if (study.userId !== token.id) return "Owner";
    if (token.role === "Admin") return "Admin";
    if (study.subscribers.findIndex((x) => x.id === token.id) !== -1) return "Subscriber";
  }

  //#region  orthanc
  async uploadAndAnonymizeStudy(files: Express.Multer.File[], token: ITokenPayload, body: AddStudyDto) {
    const filesSize = +files.reduce((acc, x) => (acc += +x.size), 0);
    const user = await userService.getUser(token.id);
    if (+user.totalSpace < +user.usedSpace + filesSize) throw new BadRequestError("not enough space");

    const uploadResults = await Promise.all(
      files.map((multerFile) => axios.post(applicationConfigs.orthanc.url + "/instances", multerFile.buffer))
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
          applicationConfigs.orthanc.url + `/studies/${originalStudyID}/anonymize`,
          {
            Keep: ["PatientName", "PatientSex", "SeriesDescription", "StudyDescription"],
            KeepPrivateTags: true,
            KeepSource: false,
          }
        );

        const getStudyInfo = await axios.get(applicationConfigs.orthanc.url + `/studies/${anonynizeResult.data.ID}`);
        const getStudyStats = await axios.get(
          applicationConfigs.orthanc.url + `/studies/${anonynizeResult.data.ID}/statistics`
        );
        const getInstances = await axios.get(
          applicationConfigs.orthanc.url + `/studies/${anonynizeResult.data.ID}/instances`
        );

        const dto: StudyDto = {
          title: body.title,
          description: body.description,
          orthac_id: anonynizeResult.data.ID,
          orthanc_originalId: originalStudyID,
          orthac_patientId: getStudyInfo.data.ParentPatient,
          orthanc_series: getStudyInfo.data.Series,
          mainTags: getStudyInfo.data.MainDicomTags,
          patientTags: getStudyInfo.data.PatientMainDicomTags,
          orthanc_instances: getInstances.data.map((x) => x.ID),
          size: +getStudyStats.data.DiskSize,
        };
        const study = await studySevice.addStudy(dto, user.id);
        user.usedSpace = +user.usedSpace + +study.size;
        await userService.userRepo.save(user);
        return study;
      })
    );
  }

  async previewStudyInstance(studyId: number, token: ITokenPayload) {
    const study = await this.getStudyById(studyId, ["subscribers"]);
    const hasAccess = this.getAccessLevelOnStudy(token, study);
    if (!hasAccess) throw new ForbidenError("access denied");
    return axios.get(applicationConfigs.orthanc.url + `/instances/${study.orthanc_instances[0]}/preview`, {
      responseType: "stream",
    });
  }
  //#endregion
}

export const studySevice = new StudyService();
