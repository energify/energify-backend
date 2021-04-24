import { Auditable } from "src/shared/entities/auditable.entity";
import { User } from "src/users/entities/user.entity";
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Measure extends Auditable {
  @PrimaryGeneratedColumn()
  id?: number;

  @Column("float")
  value: number;

  @ManyToOne(() => User)
  userId: User;
}
