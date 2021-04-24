import { Module } from "@nestjs/common";
import { MetersService } from "./meters.service";
import { MetersController } from "./meters.controller";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Measure } from "./entities/measure.entity";

@Module({
  imports: [TypeOrmModule.forFeature([Measure])],
  providers: [MetersService],
  controllers: [MetersController],
})
export class MetersModule {}
