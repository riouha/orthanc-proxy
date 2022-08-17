import { dbConnection } from "../../../app/db/db";
import { Study } from "../entities/study.entity";

class StudyService {
  private studyRepo = dbConnection.datasource.getRepository(Study);

  async addStudy(
    originalStudyID: string,
    studyID: string,
    studyInfo: any,
    statResult: any
  ) {
    const study = new Study();
    study.orthanc_originalId = originalStudyID;
    study.orthac_id = studyID;
    study.orthac_patientId = studyInfo.ParentPatient;
    study.mainTags = studyInfo.MainDicomTags;
    study.patientTags = studyInfo.PatientMainDicomTags;
    study.orthanc_series = studyInfo.Series;
    study.size = +statResult.DiskSize;
    return this.studyRepo.save(study);
  }

  async clearStudies() {}

  // async getStudyByOrthancId(id: string) {
  //   const study = await this.studyRepo.findOne({ where: { orthac_id: id } });
  //   if (!study) return;
  // }
}

export const studySevice = new StudyService();
