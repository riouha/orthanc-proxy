import { ProfessionalGroup } from "../entities/user.entity";
import { SearchDto } from "../../../common/serach.dto";

export class SignupUserDto {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  country?: string;
  professionalGroups?: ProfessionalGroup[];
}

export class SearchUsersDto extends SearchDto {
  email?: string;
}
