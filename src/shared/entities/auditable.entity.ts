import { CreateDateColumn, UpdateDateColumn } from "typeorm";

export abstract class Auditable {
  @CreateDateColumn({ update: false })
  createdAt: Date;

  @UpdateDateColumn({ update: true })
  updatedAt: Date;
}
