import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { RedisService } from "nestjs-redis";
import { Roles } from "src/shared/enums/roles.enum";
import { IAuthedUser } from "src/users/interfaces/iauthed-user.interface";
import { UsersService } from "src/users/users.service";
import { UpdateMeasurement } from "./dto/update-measurement.dto";
import { IMeasure } from "./interfaces/imeasure.interface";
import { OrderMap } from "./model/order-map.model";

@Injectable()
export class MetersService {
  constructor(private usersSerivce: UsersService, private redisService: RedisService) {}

  async findAll() {
    const keys = await this.redisService.getClient().keys("measurement.*");
    const values = new Array<IMeasure>();

    for (const key of keys) {
      values.push(JSON.parse(await this.redisService.getClient().get(key)));
    }

    return values;
  }

  async findByUser(user: IAuthedUser) {
    if (user.role === Roles.Unverified) {
      throw new BadRequestException("You must verify your account first.");
    }

    const measurementTxt = await this.redisService.getClient().get(`measurement.${user.id}`);
    const measurement = JSON.parse(measurementTxt) as IMeasure;

    if (!measurement) {
      throw new NotFoundException("Measurement not found.");
    }

    return {
      ...measurement,
      updatedAt: new Date(measurement.updatedAt),
    };
  }

  async updateByUser(user: IAuthedUser, dto: UpdateMeasurement) {
    if (user.role === Roles.Unverified) {
      throw new BadRequestException("User must verify your account first.");
    }

    const prices = await this.usersSerivce.findPricesById(user.id);

    if (!prices) {
      throw new BadRequestException("User must set buy and sell price first.");
    }

    const measurement: IMeasure = { userId: user.id, value: dto.value, updatedAt: new Date() };

    await this.redisService.getClient().set(`measurement.${user.id}`, JSON.stringify(measurement));

    return { message: "Measurement updated" };
  }

  async deleteByUser(user: IAuthedUser) {
    if (user.role === Roles.Unverified) {
      throw new BadRequestException("You must verify your account first.");
    }

    const count = await this.redisService.getClient().del(`measurement.${user.id}`);

    if (count === 0) {
      throw new NotFoundException("Measurement not found.");
    }

    return { message: "Measurement deleted" };
  }

  async deleteAll() {
    await this.redisService.getClient().del("measurement.*");
  }

  async match() {
    const prices = await this.usersSerivce.findAllPrices();
    const measurements = await this.findAll();
    return new OrderMap(prices, measurements).match();
  }
}
