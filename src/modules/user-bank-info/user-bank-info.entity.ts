import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  Index,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('user_bank_info')
export class UserBankInfo {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  customer_id: number;

  @Column({ nullable: true })
  warehouse_id: number;

  @Column({ nullable: true })
  rider_id: number;

  @Column()
  bank_name: string;

  @Column()
  account_number: string;

  @Column()
  account_holder_name: string;

  @Column()
  bsb: string;

  @Column({ default: false })
  is_default: boolean;

  @Column({ default: false })
  is_verified: boolean;

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;

  @Column({ type: 'timestamp', nullable: true })
  verified_at: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updated_at: Date;
}
