import { ConfigModule, ConfigService } from "@nestjs/config";
import { Test, TestingModule } from "@nestjs/testing";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Payment } from "src/payments/entities/payment.entity";
import { PaymentsModule } from "src/payments/payments.module";
import { InvoicesService } from "./invoices.service";

jest.setTimeout(50000);
describe("InvoicesService", () => {
  let service: InvoicesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
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
        TypeOrmModule.forFeature([Payment]),
        PaymentsModule,
      ],
      providers: [InvoicesService],
    }).compile();

    service = module.get<InvoicesService>(InvoicesService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  it("should save pdf", async () => {
    console.log(await service.generatePdfByPaymentId(9));
  });
});
