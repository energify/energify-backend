import { Auditable } from "src/shared/entities/auditable.entity";
import { User } from "src/users/entities/user.entity";
import { Column, Entity, Index, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { PaymentStatus } from "../enums/payment.status";

@Entity()
export class Payment extends Auditable {
  @PrimaryGeneratedColumn()
  id: number;

  @Column("float")
  amount: number;

  @Column("int", { default: PaymentStatus.Unpaid })
  status: PaymentStatus;

  @Column("varchar", { nullable: true })
  @Index()
  hederaTransactionId: string;

  @Column("int")
  @Index()
  consumerId: number;

  @Column("int")
  @Index()
  prosumerId: number;

  @ManyToOne(() => User)
  consumer: Promise<User>;

  @ManyToOne(() => User)
  prosumer: Promise<User>;
}
