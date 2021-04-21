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

  @ManyToOne(() => User)
  consumer: User;

  @ManyToOne(() => User)
  prosumer: User;
}
