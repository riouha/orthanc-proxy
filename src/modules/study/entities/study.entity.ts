import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";
//=============================================

@Entity()
export class Study {
  @PrimaryGeneratedColumn()
  public id: number;

  @Column({ nullable: true })
  public title?: string;

  @Column({ nullable: true })
  public description?: string;

  @Column({ type: "int8", nullable: true })
  public size?: number;

  @Column({ unique: true })
  public orthac_id: string;

  @Column({ nullable: true })
  public orthac_patientId: string;

  @Column({ nullable: true })
  public orthanc_date: string;

  @Column({ type: "json", nullable: true })
  public mainTags?: any;

  @Column({ type: "json", nullable: true })
  public patientTags?: any;

  @Column()
  public orthanc_originalId: string;

  @Column({ nullable: true })
  public modulity?: string;

  @Column({ type: "simple-array" })
  public orthanc_series: string[];

  // @ManyToOne(()=>Patient)
  // public patient: Patient;

  // @OneToMany(()=>Serie)
  // public series: Serie[];

  @CreateDateColumn({ type: "timestamp" })
  createDate: Date;
  @UpdateDateColumn({ type: "timestamp" })
  updateDate: Date;
}
