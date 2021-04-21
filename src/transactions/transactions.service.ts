import { BadRequestException, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { subSeconds } from "date-fns";
import { Roles } from "src/shared/enums/roles.enum";
import { LessThanOrEqualDate } from "src/shared/util";
import { UsersService } from "src/users/users.service";
import { Between, Repository } from "typeorm";
import { CreateTransactionDto } from "./dto/create-transaction.dto";
import { Transaction } from "./entities/transaction.entity";

@Injectable()
export class TransactionsService {
  constructor(
    @InjectRepository(Transaction)
    private transactionsRepository: Repository<Transaction>,
    private usersService: UsersService
  ) {}

  async create(dto: CreateTransactionDto) {
    const prosumer = await this.usersService.findById(dto.prosumerId);

    if (!prosumer.sellPrice || prosumer.role !== Roles.Prosumer) {
      throw new BadRequestException("Prosumer is not available to sell.");
    }

    const price = dto.amount * prosumer.sellPrice;

    return this.transactionsRepository.save({ ...dto, price });
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
}
