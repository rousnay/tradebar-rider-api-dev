import {
  PaymentStatus,
  PaymentTransactionType,
} from '@common/enums/payment.enum';
import { UserType } from '@common/enums/user.enum';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('user_bank_info')
export class UserBankInfo {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'enum',
    enum: PaymentTransactionType,
    nullable: true,
    default: null,
  })
  transaction_type: PaymentTransactionType;

  @Column({
    type: 'enum',
    enum: PaymentStatus,
    nullable: true,
    default: null,
  })
  payment_status: PaymentStatus;

  @Column({
    type: 'enum',
    enum: UserType,
    nullable: true,
    default: null,
  })
  payment_by: UserType;

  @Column({
    type: 'enum',
    enum: UserType,
    nullable: true,
    default: null,
  })
  payment_for: UserType;

  @Column({ nullable: true })
  payment_id: number;

  @Column({ nullable: true })
  customer_id: number;

  @Column({ nullable: true })
  warehouse_id: number;

  @Column({ nullable: true })
  rider_id: number;

  @Column({ nullable: true })
  order_id: number;

  @Column({ nullable: true })
  settlement_id: number;

  @Column({ nullable: true })
  fare_amount: number;

  @Column({ nullable: true })
  gst: number;

  @Column({ nullable: true })
  tradebar_fee: number;

  @Column({ nullable: true })
  total_amount: number;

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;

  @Column({ type: 'timestamp', nullable: true })
  partial_paid_at: Date;

  @Column({ type: 'timestamp', nullable: true })
  paid_at: Date;

  @Column({ type: 'timestamp', nullable: true })
  failed_at: Date;

  @Column({ type: 'timestamp', nullable: true })
  partial_refunded_at: Date;

  @Column({ type: 'timestamp', nullable: true })
  refunded_at: Date;

  @Column({ type: 'timestamp', nullable: true })
  settlement_at: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updated_at: Date;
}
