import { Test, TestingModule } from '@nestjs/testing';
import { CategoiresService } from './categoires.service';

describe('CategoiresService', () => {
  let service: CategoiresService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CategoiresService],
    }).compile();

    service = module.get<CategoiresService>(CategoiresService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
