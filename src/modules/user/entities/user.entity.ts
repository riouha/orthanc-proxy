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

  @Column({ type: "simple-array", nullable: true })
  professionalGroups: ProfessionalGroup[];

  @Column({ default: false })
  public isActive: boolean;

  @Column({ type: "bigint", default: 5e9 })
  public totalSpace: number;
  @Column({ type: "bigint", default: 0 })
  public usedSpace: number;

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

export type ProfessionalGroup =
  | "Doctor"
  | "Medical Company"
  | "Dentist"
  | "Veterinarian"
  | "Law Office"
  | "Clinical Research"
  | "Patient"
  | "Other";
export const ProfessionalGroupItems = [
  "Doctor",
  "Medical Company",
  "Dentist",
  "Veterinarian",
  "Law Office",
  "Clinical Research",
  "Patient",
  "Other",
];
