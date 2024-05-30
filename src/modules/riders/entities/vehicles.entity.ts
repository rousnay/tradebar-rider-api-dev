import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class Vehicles {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  owner_id: number;

  @Column({ nullable: true })
  type_id: number;

  @Column({ nullable: true })
  brand: string;

  @Column({ nullable: true })
  model: string;

  @Column({ nullable: true })
  color: string;

  @Column({ nullable: true })
  vehicle_image_cf_media_id: number;

  @Column({ nullable: true })
  license_plate: string;

  @Column({ length: 60, nullable: true })
  registration_number: string;

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
