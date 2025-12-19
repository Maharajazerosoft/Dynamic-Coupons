import { TestBed } from '@angular/core/testing';

import { Admob } from './admob';

describe('Admob', () => {
  let service: Admob;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Admob);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
