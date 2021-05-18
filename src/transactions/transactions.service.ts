import { Injectable } from "@nestjs/common";
import { IMatch } from "../meters/interfaces/imatch.interface";
import { Interval } from "@nestjs/schedule";
import { InjectRepository } from "@nestjs/typeorm";
import { format as formatDate, subSeconds, subHours } from "date-fns";
import { MetersService } from "src/meters/meters.service";
import { PUBLIC_GRID_USER_ID } from "src/shared/consts";
import { Between, IsNull, Not, Repository } from "typeorm";
import { CreateTransactionDto } from "./dto/create-transaction.dto";
import { Transaction } from "./entities/transaction.entity";
import { NoOverlap } from "src/shared/decorators/no-overlap.decorator";
import { intervalToDateRanges, intervalToHours } from "src/shared/util";

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

  async updatePaymentIdById(id: number, paymentId: number) {
    return this.transactionsRepository.update(id, { paymentId });
  }

  async findById(id: number) {
    return this.transactionsRepository.findOneOrFail(id);
  }

  async findByUserId(userId: number) {
    return this.transactionsRepository.find({
      where: [{ prosumerId: userId }, { consumerId: userId }],
    });
  }

  async findTotalEnergyByUserId(userId: number, start: Date, end: Date) {
    const { consumption, production } = await this.transactionsRepository
      .createQueryBuilder("transactions")
      .select("SUM(transactions.amount)", "consumption")
      .where("transactions.prosumerId = :userId", { userId })
      .andWhere("transactions.createdAt >= :start", { start })
      .andWhere("transactions.createdAt <= :end", { end })
      .addSelect("SUM(transactions.amount)", "production")
      .where("transactions.consumerId = :userId", { userId })
      .andWhere("transactions.createdAt >= :start", { start })
      .andWhere("transactions.createdAt <= :end", { end })
      .getRawOne();

    return production - consumption;
  }

  async findConsumedEnergyByUserId(userId: number, start: Date, end: Date) {
    const { energyFromCommunity } = await this.transactionsRepository
      .createQueryBuilder("transactions")
      .select("SUM(transactions.amount)", "energyFromCommunity")
      .where("transactions.consumerId = :userId", { userId })
      .andWhere("transactions.prosumerId IS NOT NULL")
      .andWhere("transactions.createdAt >= :start", { start })
      .andWhere("transactions.createdAt <= :end", { end })
      .getRawOne();

    const { energyFromPublicGrid } = await this.transactionsRepository
      .createQueryBuilder("transactions")
      .select("SUM(transactions.amount)", "energyFromPublicGrid")
      .where("transactions.consumerId = :userId", { userId })
      .andWhere("transactions.prosumerId IS NULL")
      .andWhere("transactions.createdAt >= :start", { start })
      .andWhere("transactions.createdAt <= :end", { end })
      .getRawOne();

    return {
      energyFromCommunity: energyFromCommunity ?? 0,
      energyFromPublicGrid: energyFromPublicGrid ?? 0,
    };
  }

  async findProducedEnergyByUserId(userId: number, start: Date, end: Date) {
    const { energyToCommunity } = await this.transactionsRepository
      .createQueryBuilder("transactions")
      .select("SUM(transactions.amount)", "energyToCommunity")
      .where("transactions.prosumerId = :userId", { userId })
      .andWhere("transactions.consumerId IS NOT NULL")
      .andWhere("transactions.createdAt >= :start", { start })
      .andWhere("transactions.createdAt <= :end", { end })
      .getRawOne();

    const { energyToPublicGrid } = await this.transactionsRepository
      .createQueryBuilder("transactions")
      .select("SUM(transactions.amount)", "energyToPublicGrid")
      .where("transactions.prosumerId = :userId", { userId })
      .andWhere("transactions.consumerId IS NULL")
      .andWhere("transactions.createdAt >= :start", { start })
      .andWhere("transactions.createdAt <= :end", { end })
      .getRawOne();

    return {
      energyToCommunity: energyToCommunity ?? 0,
      energyToPublicGrid: energyToPublicGrid ?? 0,
    };
  }

  async findUserEnergyFlowByDateRange(userId: number, start: Date, end: Date) {
    return {
      ...(await this.findConsumedEnergyByUserId(userId, start, end)),
      ...(await this.findProducedEnergyByUserId(userId, start, end)),
    };
  }

  async findUserEnergyByInterval(
    userId: number,
    interval: string,
    scale: number,
    start: Date = new Date()
  ) {
    const dateRanges = intervalToDateRanges(interval, scale, start);
    const values = new Array<number>();

    for (const { start, end } of dateRanges) {
      values.push(await this.findTotalEnergyByUserId(userId, start, end));
    }

    return values;
  }

  async findLastNSeconds(lastNSeconds: number, includePublicGrid: boolean = false) {
    return this.transactionsRepository.find({
      where: {
        createdAt: Between(subSeconds(new Date(), lastNSeconds), new Date()),
        consumerId: includePublicGrid ? Not(IsNull()) : Not(0),
        prosumerId: includePublicGrid ? Not(IsNull()) : Not(0),
      },
    });
  }

  async findLastByConsumerId(consumerId: number, lastNSeconds: number) {
    return this.transactionsRepository.find({
      where: { createdAt: Between(subSeconds(new Date(), lastNSeconds), new Date()), consumerId },
    });
  }

  async findAvgPriceByDateRange(start: Date, end: Date) {
    const { price } = await this.transactionsRepository
      .createQueryBuilder("transactions")
      .select("AVG(transactions.price)", "price")
      .where("transactions.createdAt > :start AND transactions.createdAt < :end", {
        start: formatDate(start, "yyyy-MM-dd HH:mm:ss"),
        end: formatDate(end, "yyyy-MM-dd HH:mm:ss"),
      })
      .getRawOne();

    return price ?? 0;
  }

  async findPriceHistoryByDateRange(start: Date, end: Date) {
    const { price } = await this.transactionsRepository
      .createQueryBuilder("transactions")
      .select("AVG(transactions.price)", "price")
      .where("transactions.createdAt >= :start", {
        start: formatDate(start, "yyyy-MM-dd HH:mm:ss"),
      })
      .andWhere("transactions.createdAt <= :end", { end: formatDate(end, "yyyy-MM-dd HH:mm:ss") })
      .getRawOne();

    return price ?? 0;
  }

  async findPriceHistoryByInterval(interval: string, scale: number, start: Date = new Date()) {
    const dateRanges = intervalToDateRanges(interval, scale, start);
    const values = new Array<number>();

    for (const { start, end } of dateRanges) {
      values.push(await this.findPriceHistoryByDateRange(start, end));
    }

    return values;
  }

  @Interval(5000)
  @NoOverlap()
  async match() {
    let index = 0;
    let matches: IMatch[];
    let transactions = new Array<Transaction>();

    do {
      matches = await this.metersService.match(index);

      for (const match of matches) {
        const { amount, consumerId, price, prosumerId, createdAt } = match;
        transactions.push(
          this.transactionsRepository.create({ amount, consumerId, prosumerId, price, createdAt })
        );
      }

      index++;
      console.log(transactions.length);
    } while (matches.length !== 0);

    await this.transactionsRepository.save(transactions);
  }
}
