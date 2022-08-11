import { dbConnection } from "../../../app/db/db";
import { ConflictError } from "../../../lib/errors/Conflict";
import { User } from "../entities/user.entity";
import { UnAuthorizedError } from "../../../lib/errors/UnAuthorized";
import { Password } from "./password.service";

class UserService {
  userRepo = dbConnection.datasource.getRepository(User);

  async getUers() {
    const users = await this.userRepo.find();
    users.forEach((x) => delete x.password);
    return users;
  }

  async signupUser(username: string, email: string, password: string) {
    const duplicateUsername = await this.userRepo.findOne({ where: { username } });
    if (duplicateUsername) throw new ConflictError("duplicate username!");

    const duplicateEmail = await this.userRepo.findOne({ where: { email } });
    if (duplicateEmail) throw new ConflictError("duplicate email!");

    const user = new User();
    user.password = password;
    user.username = username;
    user.email = email;
    return this.userRepo.save(user);
  }

  async loginUser(username: string, password: string) {
    const user = await this.userRepo.findOne({
      where: [{ username }, { email: username }],
    });
    if (!user) throw new UnAuthorizedError("invalid username or password.");
    const passwordIsCorrect = await Password.compare(password, user.password);
    if (!passwordIsCorrect) throw new UnAuthorizedError("invalid username or password.");
    return user;
  }
}

export const userService = new UserService();
