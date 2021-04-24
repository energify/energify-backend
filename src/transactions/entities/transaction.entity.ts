import { Payment } from "src/payments/entities/payment.entity";
import { Auditable } from "src/shared/entities/auditable.entity";
import { User } from "src/users/entities/user.entity";
import { Column, Entity, PrimaryGeneratedColumn, ManyToOne, Index } from "typeorm";

@Entity()
export class Transaction extends Auditable {
  @PrimaryGeneratedColumn()
  id: number;

  @Column("float")
  amount: number;

  @Column("float")
  price: number;

  @Column("int")
  @Index()
  consumerId: number;

  @Column("int")
  @Index()
  prosumerId: number;

  @Column("int")
  @Index()
  paymentId: number;

  @ManyToOne(() => User)
  consumer: Promise<User>;

  @ManyToOne(() => User)
  prosumer: Promise<User>;

  @ManyToOne(() => Payment)
  payment: Payment;
}