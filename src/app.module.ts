import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { ScheduleModule } from "@nestjs/schedule";
import { TypeOrmModule } from "@nestjs/typeorm";

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
        synchronize: configService.get<boolean>("DEBUG"),
        keepConnectionAlive: true,
        autoLoadEntities: true,
      }),
    }),
    ScheduleModule.forRoot(),
    ConfigModule.forRoot(),
  ],
})
export class AppModule {}
