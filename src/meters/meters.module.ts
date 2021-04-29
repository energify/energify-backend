import { Module } from "@nestjs/common";
import { MetersService } from "./meters.service";
import { MetersController } from "./meters.controller";
import { UsersModule } from "src/users/users.module";

@Module({
  imports: [UsersModule],
  providers: [MetersService],
  controllers: [MetersController],
})
export class MetersModule {}
