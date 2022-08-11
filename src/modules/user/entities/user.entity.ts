import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, BeforeInsert } from "typeorm";
import { Password } from "../services/password.service";
//=============================================

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  public id: number;

  @Column({ unique: true })
  public username: string;

  @Column({ unique: true })
  public email: string;

  @Column()
  public password: string;

  @Column({ nullable: true })
  public fullname?: string;

  @Column({ nullable: true })
  public phone?: string;

  @Column({ nullable: true })
  public image?: string;

  @Column({ default: true })
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
