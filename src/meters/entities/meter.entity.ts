import { Auditable } from "src/shared/entities/auditable.entity";
import { Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Meter extends Auditable {
  @PrimaryGeneratedColumn()
  id: number;
}
