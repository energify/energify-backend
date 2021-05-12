import { ConfigModule, ConfigService } from "@nestjs/config";
import { Test, TestingModule } from "@nestjs/testing";
import { TypeOrmModule } from "@nestjs/typeorm";
import { isPast } from "date-fns";
import { RedisModule } from "nestjs-redis";
import { Roles } from "src/shared/enums/roles.enum";
import { IAuthedUser } from "src/users/interfaces/iauthed-user.interface";
import { UsersModule } from "src/users/users.module";
import { MetersService } from "./meters.service";

describe("MetersService", () => {
  let metersService: MetersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        UsersModule,
        TypeOrmModule.forRootAsync({
          imports: [ConfigModule.forRoot()],
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
            entities: ["**/*.entity.ts"],
          }),
        }),
        RedisModule.forRootAsync({
          imports: [ConfigModule.forRoot()],
          inject: [ConfigService],
          useFactory: async (configService: ConfigService) => ({
            host: configService.get<string>("REDIS_HOST"),
            username: configService.get<string>("REDIS_USER"),
            password: configService.get<string>("REDIS_PASSWORD"),
            database: configService.get<string>("REDIS_NAME"),
          }),
        }),
      ],
      providers: [MetersService],
    }).compile();

    metersService = module.get<MetersService>(MetersService);
  });

  it("should be defined", () => {
    expect(metersService).toBeDefined();
  });

  it("should update and find measurement of an user", async () => {
    const user1: IAuthedUser = {
      id: 15,
      email: "vasco@energify.pt",
      name: "Vasco Sousa",
      role: Roles.Prosumer,
      birthdate: new Date(),
    };

    const user2: IAuthedUser = {
      id: 5,
      email: "test@energify.pt",
      name: "Test Account",
      role: Roles.Prosumer,
      birthdate: new Date(),
    };

    await metersService.updateByUser(user1, { value: 10 });
    const measurement1 = await metersService.findByUser(user1);

    await metersService.updateByUser(user2, { value: 5 });
    const measurement2 = await metersService.findByUser(user2);

    expect(measurement1.value).toBe(10);
    expect(measurement1.userId).toBe(15);
    expect(isPast(measurement1.updatedAt)).toBe(true);

    expect(measurement2.value).toBe(5);
    expect(measurement2.userId).toBe(5);
    expect(isPast(measurement2.updatedAt)).toBe(true);
  });

  it("should reconstruct energy flow", async () => {
    const ordersMap = await metersService.match();
  });
});
