import { Test, TestingModule } from "@nestjs/testing";
import { MetersService } from "./meters.service";

describe("MetersService", () => {
  let metersService: MetersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MetersService],
    }).compile();

    metersService = module.get<MetersService>(MetersService);
  });

  it("should be defined", () => {
    expect(metersService).toBeDefined();
  });

  it("should create a meter", async () => {
    await metersService.create();
  });

  it("should update measurement of a meter", async () => {
    await metersService.updateMeasurement(1, { measurement: 100 });
    const measurement = await metersService.getMeasurement(1);
    expect(measurement).toBe(100);
  });
});
