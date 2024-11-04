import { TestBed } from '@angular/core/testing';

import { SoundEngineService } from './sound-engine.service';

describe('SoundEngineService', () => {
  let service: SoundEngineService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SoundEngineService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
