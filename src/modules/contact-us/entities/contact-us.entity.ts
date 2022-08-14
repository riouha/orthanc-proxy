import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from "typeorm";
//=============================================
@Entity()
export class ContactUs {
  @PrimaryGeneratedColumn()
  public id: number;

  @Column()
  public email: string;

  @Column()
  public message: string;

  @Column({ nullable: true })
  public firstName?: string;

  @Column({ nullable: true })
  public lastName?: string;

  @Column({ nullable: true })
  public phone?: string;

  @CreateDateColumn({ type: "timestamp" })
  createDate: Date;
  @UpdateDateColumn({ type: "timestamp" })
  updateDate: Date;
}
