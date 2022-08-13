import { dbConnection } from "../../../app/db/db";
import { ConflictError } from "../../../lib/errors/Conflict";
import { User } from "../entities/user.entity";
import { UnAuthorizedError } from "../../../lib/errors/UnAuthorized";
import { Password } from "./password.service";
import { SignupUserDto } from "../dto/user.dto";

class UserService {
  userRepo = dbConnection.datasource.getRepository(User);

  async getUers() {
    const users = await this.userRepo.find();
    users.forEach((x) => delete x.password);
    return users;
  }

  async signupUser(dto: SignupUserDto) {
    const duplicateEmail = await this.userRepo.findOne({
      where: { email: dto.email },
    });
    if (duplicateEmail) throw new ConflictError("duplicate email!");

    const user = new User();
    user.password = dto.password;
    user.email = dto.email;
    user.firstName = dto.firstName;
    user.lastName = dto.lastName;
    user.country = dto.country;
    return this.userRepo.save(user);
  }

  async loginUser(email: string, password: string) {
    const user = await this.userRepo.findOne({
      where: { email },
    });
    if (!user) throw new UnAuthorizedError("invalid email or password.");
    const passwordIsCorrect = await Password.compare(password, user.password);
    if (!passwordIsCorrect)
      throw new UnAuthorizedError("invalid email or password.");
    return user;
  }
}

export const userService = new UserService();
