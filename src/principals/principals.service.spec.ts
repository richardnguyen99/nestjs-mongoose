import { Test, TestingModule } from '@nestjs/testing';
import { PrincipalsService } from './principals.service';

describe('PrincipalsService', () => {
  let service: PrincipalsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PrincipalsService],
    }).compile();

    service = module.get<PrincipalsService>(PrincipalsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
