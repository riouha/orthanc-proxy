import { ProfessionalGroup } from "../entities/user.entity";

export class SignupUserDto {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  country?: string;
  professionalGroups?: ProfessionalGroup[];
}
