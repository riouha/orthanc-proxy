import { SearchDto } from "../../../common/serach.dto";
import Joi from "joi";
export class SearchStudyDto extends SearchDto {
  title?: string;
  published?: number;
  subscribed?: number;
}

export const SerachStudySchema = Joi.object({
  offset: Joi.number().integer().min(0),
  limit: Joi.number().integer().min(0),
  title: Joi.string(),
  published: Joi.valid("1"),
  subscribed: Joi.when("published", { is: Joi.exist(), then: Joi.forbidden, otherwise: Joi.valid("1") }),
});

export class EditStudyDto {
  title?: string;
  description?: string;
  favorite?: boolean;
}
export const EditStudySchema = Joi.object({
  title: Joi.string(),
  description: Joi.string(),
  favorite: Joi.boolean(),
});

export const DeleteStudiesSchema = Joi.object({
  ids: Joi.array().items(Joi.number().integer()).min(1).required(),
});

export class AddStudyDto {
  title?: string;
  description?: string;
}
export class StudyDto extends AddStudyDto {
  orthac_id: string;
  orthanc_originalId: string;
  orthac_patientId: string;
  mainTags?: any;
  patientTags?: any;
  orthanc_series: string[];
  orthanc_instances: string[];
  size: number;
}
