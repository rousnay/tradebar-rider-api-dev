import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class RiderVehicles {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  rider_id: number;

  @Column({ nullable: true })
  type_id: number;

  @Column({ nullable: true })
  capacity: number;

  @Column({ length: 50, unique: true, nullable: true })
  registration_number: string;

  @Column({ length: 50, unique: true, nullable: true })
  tax_token_number: string;

  @Column({ length: 50, nullable: true })
  owner_name: string;
}
