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

  @Column()
  public title: string;

  @Column({ nullable: true })
  public modulity?: string;

  @Column({ nullable: true })
  public accession?: string;

  @Column({ nullable: true })
  public description?: string;

  @Column({ unique: true })
  public orthac_id: string;

  @Column({ nullable: true })
  public orthac_patientId: string;

  @Column({ nullable: true })
  public orthac_patientName: string;

  @Column({ nullable: true })
  public dcm_date: string;

  @Column({ type: "bigint", nullable: true })
  public size?: number;

  @Column({ type: "json", nullable: true })
  public mainTags?: any;

  @Column({ type: "json", nullable: true })
  public patientTags?: any;

  // @ManyToOne(()=>Patient)
  // public patient: Patient;

  // @OneToMany(()=>Serie)
  // public series: Serie[];

  @CreateDateColumn({ type: "timestamp" })
  createDate: Date;
  @UpdateDateColumn({ type: "timestamp" })
  updateDate: Date;
}
