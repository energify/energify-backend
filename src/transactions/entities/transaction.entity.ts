import { Auditable } from "src/shared/entities/auditable.entity";
import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Transaction extends Auditable {
  @PrimaryGeneratedColumn()
  id: number;

  //TODO
  supplier: string;
  receiver: string;

  @Column("float")
  amount: number;
}
