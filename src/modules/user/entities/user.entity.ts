import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  BeforeInsert,
} from "typeorm";
import { Password } from "../services/password.service";
//=============================================
export type UserRole = "Admin" | "User";
@Entity()
export class User {
  @PrimaryGeneratedColumn()
  public id: number;

  @Column({ unique: true })
  public email: string;

  @Column({ nullable: true })
  public password: string;

  @Column({ default: "User", enum: ["User", "Admin"] })
  role: UserRole;

  @Column({ nullable: true })
  public firstName?: string;

  @Column({ nullable: true })
  public lastName?: string;

  @Column({ nullable: true })
  public phone?: string;

  @Column({ nullable: true })
  public image?: string;

  @Column({ nullable: true })
  public country?: string;

  @Column({ default: false })
  public isActive: boolean;

  @CreateDateColumn({ type: "timestamp" })
  createDate: Date;
  @UpdateDateColumn({ type: "timestamp" })
  updateDate: Date;

  //
  @BeforeInsert()
  async hashPassword() {
    // event.entity //event: InsertEvent<User>
    this.password = await Password.toHash(this.password);
  }
}
