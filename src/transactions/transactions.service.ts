import { BadRequestException, Injectable, Logger } from "@nestjs/common";
import { Interval } from "@nestjs/schedule";
import { InjectRepository } from "@nestjs/typeorm";
import { subSeconds } from "date-fns";
import { MetersService } from "src/meters/meters.service";
import { PUBLIC_GRID_USER_ID } from "src/shared/consts";
import { Roles } from "src/shared/enums/roles.enum";
import { User } from "src/users/entities/user.entity";
import { UsersService } from "src/users/users.service";
import { Between, Repository } from "typeorm";
import { CreateTransactionDto } from "./dto/create-transaction.dto";
import { Transaction } from "./entities/transaction.entity";

@Injectable()
export class TransactionsService {
  constructor(
    @InjectRepository(Transaction)
    private transactionsRepository: Repository<Transaction>,
    private metersService: MetersService
  ) {}

  async create(dto: CreateTransactionDto) {
    return this.transactionsRepository.save({
      ...dto,
      prosumerId: dto.prosumerId !== PUBLIC_GRID_USER_ID ? dto.prosumerId : undefined,
      consumerId: dto.consumerId !== PUBLIC_GRID_USER_ID ? dto.consumerId : undefined,
    });
  }

  async delete(id: number) {
    return this.transactionsRepository.delete(id);
  }

  async findById(id: number) {
    return this.transactionsRepository.findOneOrFail(id);
  }

  async findByUserId(userId: number) {
    return this.transactionsRepository.find({
      where: [{ prosumerId: userId }, { consumerId: userId }],
    });
  }

  async findLastNSeconds(lastNSeconds: number) {
    return this.transactionsRepository.find({
      where: { createdAt: Between(subSeconds(new Date(), lastNSeconds), new Date()) },
    });
  }

  async findLastByConsumerId(consumerId: number, lastNSeconds: number) {
    return this.transactionsRepository.find({
      where: { createdAt: Between(subSeconds(new Date(), lastNSeconds), new Date()), consumerId },
    });
  }

  @Interval(15000)
  async match() {
    Logger.log("Matching started", "TransactionsService");

    const matches = await this.metersService.match();

    Logger.log(`Matching finished ${matches.length} matches done.`, "TransactionsService");

    for (const match of matches) {
      const { amount, consumerId, price, prosumerId } = match;
      await this.create({ amount, consumerId, prosumerId, price });
    }
  }
}
