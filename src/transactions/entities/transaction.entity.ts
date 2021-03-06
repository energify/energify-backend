import { Payment } from "src/payments/entities/payment.entity";
import { Auditable } from "src/shared/entities/auditable.entity";
import { User } from "src/users/entities/user.entity";
import { Column, Entity, PrimaryGeneratedColumn, ManyToOne, Index } from "typeorm";

@Entity()
export class Transaction {
  @PrimaryGeneratedColumn()
  id: number;

  @Column("float")
  amount: number;

  @Column("float")
  price: number;

  @Column("int", { nullable: true })
  @Index()
  consumerId: number;

  @Column("int", { nullable: true })
  @Index()
  prosumerId: number;

  @Column("int", { nullable: true })
  @Index()
  paymentId: number;

  @Column("datetime", { nullable: true })
  createdAt: Date;

  @ManyToOne(() => User)
  consumer?: Promise<User> | undefined;

  @ManyToOne(() => User)
  prosumer?: Promise<User> | undefined;

  @ManyToOne(() => Payment)
  payment?: Promise<Payment> | undefined;
}
