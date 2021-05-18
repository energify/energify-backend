import { Injectable } from "@nestjs/common";
import { fromUnixTime } from "date-fns";
import { RedisService } from "nestjs-redis";
import { UsersService } from "src/users/users.service";
import { AddMeasureDto } from "./dto/add-measure.dto";
import { IMeasure } from "./interfaces/imeasure.interface";
import { OrderMap } from "./model/order-map.model";

@Injectable()
export class MetersService {
  constructor(private usersSerivce: UsersService, private redisService: RedisService) {}

  async findMeasuresByIndex(index: number) {
    const redis = this.redisService.getClient();
    const keys = await redis.keys("measurements.*");
    const values = new Array<IMeasure>();

    for (const key of keys) {
      const value = JSON.parse((await redis.get(key)) as any)[index];
      if (value) {
        values.push(value);
      }
    }

    return values;
  }

  async deleteMeasuresByIndex(index: number) {
    const redis = this.redisService.getClient();
    const keys = await redis.keys("measurements.*");

    for (const key of keys) {
      const values = JSON.parse(await redis.get(key)).filter((_, i) => i !== index);
      await redis.set(key, JSON.stringify(values));
    }
  }

  async findMeasuresByUserId(userId: number) {
    const redis = this.redisService.getClient();
    const measurementTxt = await redis.get(`measurements.${userId}`);

    if (!measurementTxt) {
      await redis.set(`measurements.${userId}`, "[]");
      return [];
    }

    return JSON.parse(measurementTxt) as IMeasure[];
  }

  async deleteMeasuresByUserId(userId: number) {
    const redis = this.redisService.getClient();
    await redis.set(`measurements.${userId}`, "[]");

    return { message: "Measurement deleted" };
  }

  async addMeasuresByUserId(userId: number, dto: AddMeasureDto) {
    const redis = this.redisService.getClient();
    const measurements = await this.findMeasuresByUserId(userId);

    for (const { timestamp, value } of dto.measures) {
      measurements.push({ userId, value: value, date: fromUnixTime(timestamp) });
      await redis.set(`measurements.${userId}`, JSON.stringify(measurements));
    }

    return { message: "Measurements added" };
  }

  async match(index: number) {
    const prices = await this.usersSerivce.findAllPrices();
    const measurements = await this.findMeasuresByIndex(index);

    if (measurements.length !== 0) {
      await this.deleteMeasuresByIndex(index);
      return new OrderMap(prices, measurements).match();
    }

    return [];
  }
}
