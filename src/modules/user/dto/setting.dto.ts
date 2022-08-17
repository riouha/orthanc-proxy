import Joi from "joi";

export class SpaceSettingDto {
  space: number;
  userIds?: number[];
}
export const SpaceSettingSchema = Joi.object({
  space: Joi.number().integer().required(),
  userIds: Joi.array().items(Joi.number().integer()),
});
