import { scrypt, randomBytes } from "crypto";
import { promisify } from "util";

export class Password {
  static async toHash(password: string) {
    const salt = randomBytes(8).toString("hex");
    const buffer = (await promisify(scrypt)(password, salt, 64)) as Buffer;
    const hash = `${buffer.toString("hex")}.${salt}`;
    return hash;
  }

  static async compare(enteredPassword: string, truePassword: string) {
    const [hashedPasswored, salt] = truePassword.split(".");
    const buffer = (await promisify(scrypt)(enteredPassword, salt, 64)) as Buffer;
    return buffer.toString("hex") === hashedPasswored;
  }
}
