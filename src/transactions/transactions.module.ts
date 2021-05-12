import { Module } from "@nestjs/common";
import { TransactionsService } from "./transactions.service";
import { TransactionsController } from "./transactions.controller";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Transaction } from "./entities/transaction.entity";
import { UsersModule } from "src/users/users.module";
import { MetersModule } from "src/meters/meters.module";

@Module({
  imports: [TypeOrmModule.forFeature([Transaction]), UsersModule, MetersModule],
  providers: [TransactionsService],
  controllers: [TransactionsController],
  exports: [TransactionsService],
})
export class TransactionsModule {}
