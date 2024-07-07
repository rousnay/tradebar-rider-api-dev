import {
  Entity,
  BaseEntity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToMany,
  JoinTable,
} from 'typeorm';

export enum Gender {
  MALE = 'male',
  FEMALE = 'female',
  OTHER = 'other',
}
@Entity()
export class Riders extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  user_id: number;

  @Column({ length: 50 })
  first_name: string;

  @Column({ length: 50 })
  last_name: string;

  @Column({ length: 20, nullable: true })
  phone: string;

  @Column({ nullable: true })
  email: string;

  @Column({ type: 'date', nullable: true })
  date_of_birth: Date;

  @Column({
    type: 'enum',
    enum: Gender,
    nullable: true,
    // default: Gender.OTHER
  })
  gender: Gender | null; // Define the column as nullable in the entity

  @Column({ nullable: true })
  profile_image_cf_media_id: number;

  @Column({ nullable: true })
  driving_license_number: string;

  @Column({ nullable: true })
  driving_license_authorized_office_id: number;

  @Column({ nullable: true })
  driving_license_cf_media_id: string;

  @Column({ nullable: true })
  verification_selfie_cf_media_id: string;

  @Column({ nullable: true })
  driving_city_id: number;

  @Column({ nullable: true })
  driving_destination_range_id: number;

  @Column({ nullable: true })
  driving_schedule_id: number;

  @Column({ nullable: true })
  active_vehicle_id: number;

  @Column({ default: false })
  is_driving_license_verified: boolean;

  @Column({ default: true })
  is_active: boolean;

  @Column({ default: false })
  is_approved: boolean;

  @CreateDateColumn({ type: 'timestamp', nullable: true })
  registration_date: Date;

  @UpdateDateColumn({ type: 'timestamp', nullable: true })
  last_login: Date;

  @CreateDateColumn({
    type: 'timestamp',
    nullable: true,
  })
  created_at: Date;

  @UpdateDateColumn({
    type: 'timestamp',
    nullable: true,
  })
  updated_at: Date;
}
