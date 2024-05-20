import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
} from 'typeorm';

@Entity()
export class RiderVehicles {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  rider_id: number;

  @Column({ nullable: true })
  vehicle_id: number;

  @CreateDateColumn({
    type: 'timestamp',
    nullable: true,
  })
  created_at: Date;
}
