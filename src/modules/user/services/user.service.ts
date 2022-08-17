import { dbConnection } from "../../../app/db/db";
import { ConflictError } from "../../../lib/errors/Conflict";
import { User } from "../entities/user.entity";
import { UnAuthorizedError } from "../../../lib/errors/UnAuthorized";
import { Password } from "./password.service";
import { SignupUserDto } from "../dto/user.dto";
import { ForbidenError } from "../../../lib/errors/Forbiden";
import { randomBytes, createHmac } from "crypto";
import { applicationConfigs } from "../../../config/config";
import { NotFoundError } from "../../../lib/errors/NotFound";
import { SpaceSettingDto } from "../dto/setting.dto";

class UserService {
  userRepo = dbConnection.datasource.getRepository(User);

  async getUser(id: number) {
    const user = await this.userRepo.findOne({ where: { id } });
    if (!user) throw new NotFoundError("user not found");
    return user;
  }

  async getAllUsers() {
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
    user.professionalGroups = dto.professionalGroups;
    await this.userRepo.save(user, { reload: true });

    //@TODO
    const hash = this.generateVerificationHash(user.id, user.email);
    //mailService.send(user.email,hash)
    return { user, hash };
  }

  async loginUser(email: string, password: string) {
    const user = await this.userRepo.findOne({
      where: { email },
    });
    if (!user) throw new UnAuthorizedError("invalid email or password.");
    const passwordIsCorrect = await Password.compare(password, user.password);
    if (!passwordIsCorrect)
      throw new UnAuthorizedError("invalid email or password.");
    if (!user.isActive) throw new ForbidenError("verify your account.");

    return user;
  }

  async varifyUser(email: string, fullHash: string) {
    const user = await this.userRepo.findOne({
      where: { email },
    });
    if (!user) throw new NotFoundError("not found");
    if (user.isActive) throw new ConflictError("already is verified.");

    const hashIsValid = this.verifyHash(fullHash, user.id, user.email);
    if (!hashIsValid) throw new UnAuthorizedError("invalid hash.");

    user.isActive = true;
    return this.userRepo.save(user);
  }

  async forgetPassword(email: string) {
    const user = await this.userRepo.findOne({
      where: { email },
    });
    if (!user) throw new NotFoundError("not found");

    //@TODO
    const hash = this.generateVerificationHash(user.id, user.email, 3);
    //mailService.send(user.email,hash)
    return { hash };
  }

  async changePassword(email: string, fullHash: string, newPassword: string) {
    const user = await this.userRepo.findOne({
      where: { email },
    });
    if (!user) throw new NotFoundError("not found");

    const hashIsValid = this.verifyHash(fullHash, user.id, user.email);
    if (!hashIsValid) throw new UnAuthorizedError("invalid hash.");
    user.password = await Password.toHash(newPassword);
    return this.userRepo.save(user);
  }

  private generateVerificationHash(
    id: number,
    email: string,
    expireDate = 1000
  ) {
    const ttl = expireDate * 24 * 60 * 60 * 1000; // 7 days
    const expires = Date.now() + ttl;
    const data = `${email}.${id}.${expires}`;
    const hash = createHmac("sha256", applicationConfigs.jwt.secret)
      .update(data)
      .digest("hex"); // creating SHA256 hash of the data
    return `${hash}.${expires}`; // Hash.expires => send to the user
  }

  private verifyHash(fullHash: string, id: number, email: string): boolean {
    const [hash, expires] = fullHash.split(".");
    if (Date.now() > parseInt(expires)) return false;

    const data = `${email}.${id}.${expires}`;
    const newHash = createHmac("sha256", applicationConfigs.jwt.secret)
      .update(data)
      .digest("hex"); // creating SHA256 hash of the data
    if (hash === newHash) return true;
    return false;
  }

  public modifyUserSpace(dto: SpaceSettingDto) {
    const query = dbConnection.datasource
      .createQueryBuilder()
      .update(User)
      .set({ totalSpace: dto.space });
    if (dto.userIds?.length)
      query.where("id IN (:...userIds)", { userIds: dto.userIds });
    return query.execute();
  }
}

export const userService = new UserService();
