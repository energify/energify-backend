import { Module } from "@nestjs/common";
import { UsersService } from "./users.service";
import { UsersController } from "./users.controller";
import { TypeOrmModule } from "@nestjs/typeorm";
import { User } from "./entities/user.entity";
import { ConfigModule } from "@nestjs/config";
import { RedisModule } from "nestjs-redis";

@Module({
  imports: [TypeOrmModule.forFeature([User]), RedisModule, ConfigModule],
  providers: [UsersService],
  controllers: [UsersController],
  exports: [UsersService],
})
export class UsersModule {}
