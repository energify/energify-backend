import { ConfigModule } from "@nestjs/config";
import { Test, TestingModule } from "@nestjs/testing";
import { HederaService } from "./hedera.service";

describe("HederaService", () => {
  jest.setTimeout(100000);

  let hederaService: HederaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule.forRoot()],
      providers: [HederaService],
    }).compile();

    hederaService = module.get<HederaService>(HederaService);
  });

  it("should be defined", () => {
    expect(hederaService).toBeDefined();
  });

  it("should find transactions id", async () => {
    const transaction = await hederaService.findTransactionByAccountId(
      "0.0.460923-1619180464-557582609",
      "0.0.460923"
    );

    expect(transaction.result).toBe("SUCCESS");
    expect(transaction.consensus_timestamp).toBe("1619180475.823211000");
  });

  it("should validate transaction", async () => {
    const isValid = await hederaService.isTransactionValid(
      "0.0.460923-1619180491-247405115",
      "0.0.539171",
      "0.0.539172",
      100
    );

    expect(isValid).toBe(true);
  });
});
