import { Test, TestingModule } from '@nestjs/testing';
import { MetersService } from './meters.service';

describe('MetersService', () => {
  let service: MetersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MetersService],
    }).compile();

    service = module.get<MetersService>(MetersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
