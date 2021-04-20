import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { RedisService } from "nestjs-redis";
import { Roles } from "src/shared/enums/roles.enum";
import { IAuthedUser } from "src/users/interfaces/iauthed-user.entity";
import { UpdateMeter } from "./dto/update-meter.dto";
import { Meter } from "./entities/meter.entity";

@Injectable()
export class MetersService {
  constructor(private redisService: RedisService) {}

  async findByUser(user: IAuthedUser) {
    if (user.role === Roles.Unverified) {
      throw new BadRequestException("You must verify your account first.");
    }

    const meterTxt = await this.redisService.getClient().get(`meter.${user.id}`);
    const meter = JSON.parse(meterTxt) as Meter;

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
}
