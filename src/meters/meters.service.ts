import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { Interval } from "@nestjs/schedule";
import { InjectRepository } from "@nestjs/typeorm";
import { RedisService } from "nestjs-redis";
import { Roles } from "src/shared/enums/roles.enum";
import { IAuthedUser } from "src/users/interfaces/iauthed-user.entity";
import { Repository } from "typeorm";
import { UpdateMeter } from "./dto/update-meter.dto";
import { Measure } from "./entities/measure.entity";

@Injectable()
export class MetersService {
  constructor(
    @InjectRepository(Measure) private measurementsRepository: Repository<Measure>,
    private redisService: RedisService
  ) {}

  async findAll() {
    const metersTxt = await this.redisService.getClient().keys("meter.*");
    return metersTxt.map((m) => JSON.parse(m)) as Measure[];
  }

  async findByUser(user: IAuthedUser) {
    if (user.role === Roles.Unverified) {
      throw new BadRequestException("You must verify your account first.");
    }

    const meterTxt = await this.redisService.getClient().get(`meter.${user.id}`);
    const meter = JSON.parse(meterTxt) as Measure;

    if (!meter) {
      throw new NotFoundException("Meter not found.");
    }

    return meter;
  }

  async updateByUser(user: IAuthedUser, dto: UpdateMeter) {
    if (user.role === Roles.Unverified) {
      throw new BadRequestException("You must verify your account first.");
    }

    const meterTxt = JSON.stringify({
      userId: user.id,
      measurement: dto.measurement,
      updatedAt: new Date(),
    });

    await this.redisService.getClient().set(`meter.${user.id}`, meterTxt);

    return { message: "Meter updated" };
  }

  async deleteByUser(user: IAuthedUser) {
    if (user.role === Roles.Unverified) {
      throw new BadRequestException("You must verify your account first.");
    }

    const count = await this.redisService.getClient().del(`meter.${user.id}`);

    if (count === 0) {
      throw new NotFoundException("Meter not found.");
    }

    return { message: "Meter deleted" };
  }

  async deleteAll() {
    await this.redisService.getClient().del("meter.*");
  }

  async persist(measurements: Measure[]) {
    return this.measurementsRepository.save(measurements);
  }

  @Interval(15000)
  async monitor() {
    const measurements = await this.findAll();
    const negativeMeasurements = measurements.filter((m) => m.value < 0);
    const positiveMeasurements = measurements.filter((m) => m.value > 0);

    return this.persist(measurements);
  }
}
