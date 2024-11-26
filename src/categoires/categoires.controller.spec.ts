import { Test, TestingModule } from '@nestjs/testing';
import { CategoiresController } from './categoires.controller';
import { CategoiresService } from './categoires.service';

describe('CategoiresController', () => {
  let controller: CategoiresController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CategoiresController],
      providers: [CategoiresService],
    }).compile();

    controller = module.get<CategoiresController>(CategoiresController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
