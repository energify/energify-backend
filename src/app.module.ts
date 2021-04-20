import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { APP_GUARD } from "@nestjs/core";
import { ScheduleModule } from "@nestjs/schedule";
import { TypeOrmModule } from "@nestjs/typeorm";
import { RedisModule } from "nestjs-redis";
import { MetersModule } from "./meters/meters.module";
import { AuthGuard } from "./shared/guards/auth.guard";

import { UsersModule } from "./users/users.module";

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        type: configService.get<string>("DB_DRIVER") as any,
        host: configService.get<string>("DB_HOST"),
        username: configService.get<string>("DB_USER"),
        password: configService.get<string>("DB_PASSWORD"),
        database: configService.get<string>("DB_NAME"),
        port: configService.get<number>("DB_PORT"),
        synchronize: configService.get<boolean>("DEBUG"),
        keepConnectionAlive: true,
        autoLoadEntities: true,
      }),
    }),
    RedisModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        host: configService.get<string>("REDIS_HOST"),
        username: configService.get<string>("REDIS_USER"),
        password: configService.get<string>("REDIS_PASSWORD"),
        database: configService.get<string>("REDIS_NAME"),
      }),
    }),
    ScheduleModule.forRoot(),
    ConfigModule.forRoot(),
    MetersModule,
    UsersModule,
  ],
  providers: [{ provide: APP_GUARD, useClass: AuthGuard }],
})
export class AppModule {}
