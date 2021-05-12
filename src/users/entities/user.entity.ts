import { Auditable } from "src/shared/entities/auditable.entity";
import { Roles } from "src/shared/enums/roles.enum";
import { Column, Entity, OneToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class User extends Auditable {
  @PrimaryGeneratedColumn()
  id: number;

  @Column("varchar")
  name: string;

  @Column("varchar", { nullable: true, unique: true })
  nif: string;

  @Column("varchar", { unique: true })
  cc: string;

  @Column("varchar", { unique: true })
  email: string;

  @Column("varchar")
  password: string;

  @Column("varchar", { nullable: true })
  address: string;

  @Column("datetime")
  bornAt: Date;

  @Column("varchar", { nullable: true })
  pictureUrl: string;

  @Column("varchar", { nullable: true, unique: true })
  certificateUrl: string;

  @Column("int", { default: Roles.Unverified })
  role: Roles;

  @Column("varchar", { nullable: true })
  hederaAccountId: string;
}
