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
import { intervalToHours } from "src/shared/util";

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

  async findConsumedEnergyByUserId(userId: number) {
    const { energyFromCommuniy } = await this.transactionsRepository
      .createQueryBuilder("transactions")
      .where("transactions.consumerId = :userId", { userId })
      .andWhere("transactions.prosumerId IS NOT NULL")
      .select("SUM(transactions.amount)", "totalEnergy")
      .getRawOne();

    const { energyFromPublicGrid } = await this.transactionsRepository
      .createQueryBuilder("transactions")
      .where("transactions.consumerId = :userId", { userId })
      .andWhere("transactions.prosumerId IS NULL")
      .select("SUM(transactions.amount)", "totalEnergy")
      .getRawOne();

    return { energyFromCommuniy, energyFromPublicGrid };
  }

  async findProducedEnergyByUserId(userId: number) {
    const { energyToCommunity } = await this.transactionsRepository
      .createQueryBuilder("transactions")
      .where("transactions.prosumerId = :userId", { userId })
      .andWhere("transactiosn.consumerId IS NOT NULL")
      .select("SUM(transactions.amount)", "energyToCommunity")
      .getRawOne();

    const { energyToPublicGrid } = await this.transactionsRepository
      .createQueryBuilder("transactions")
      .where("transactions.prosumerId = :userId", { userId })
      .andWhere("transactiosn.consumerId IS NULL")
      .select("SUM(transactions.amount)", "energyToPublicGrid")
      .getRawOne();

    return { energyToCommunity, energyToPublicGrid };
  }

  async findStatsByUserId(userId: number) {
    return {
      ...(await this.findConsumedEnergyByUserId(userId)),
      ...(await this.findProducedEnergyByUserId(userId)),
    };
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

  async findPriceByDateRange(start: Date, end: Date) {
    const { minPrice } = await this.transactionsRepository
      .createQueryBuilder("transactions")
      .where("transactions.createdAt > :start AND transactions.createdAt < :end", {
        start: formatDate(start, "yyyy-MM-dd HH:mm:ss"),
        end: formatDate(end, "yyyy-MM-dd HH:mm:ss"),
      })
      .select("MIN(transactions.price)", "minPrice")
      .getRawOne();

    return { price: parseFloat((minPrice ?? 0).toFixed(2)) };
  }

  async findPriceHistoryByInterval(interval: "1h" | "1d" | "1w" | "1m" | "1y", scale: number) {
    let now = new Date();
    let i = 0;
    let average = new Array();

    while (i < scale) {
      const formatNow = formatDate(now, "yyyy-MM-dd HH:mm:ss");
      let before = subHours(now, intervalToHours(interval));
      const formatBefore = formatDate(before, "yyyy-MM-dd HH:mm:ss");

      const { value } = await this.transactionsRepository
        .createQueryBuilder("transactions")
        .where("transactions.createdAt >= :before AND transactions.createdAt <= :now", {
          before: formatBefore,
          now: formatNow,
        })
        .select("AVG(transactions.price)", "average")
        .getRawOne();
      now = before;
      i++;

      average[i] = value;
    }

    return average;
  }

  @Interval(10)
  @NoOverlap()
  async match() {
    let index = 0;
    let matches: IMatch[];

    do {
      matches = await this.metersService.match(index);

      for (const match of matches) {
        const { amount, consumerId, price, prosumerId } = match;
        await this.create({ amount, consumerId, prosumerId, price });
      }
    } while (matches.length !== 0);
  }
}
