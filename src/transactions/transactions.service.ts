import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { CreateTransactionDto } from "./dto/create-transaction.dto";
import { Transaction } from "./entities/transaction.entity";

@Injectable()
export class TransactionsService {
  constructor(
    @InjectRepository(Transaction)
    private transactionsRepository: Repository<Transaction>
  ) {}

  async create(dto: CreateTransactionDto) {
    return this.transactionsRepository.save(dto);
  }

  async delete(id: number) {
    return this.transactionsRepository.delete(id);
  }

  async findById(id: number) {
    return this.transactionsRepository.findOneOrFail(id);
  }
}
