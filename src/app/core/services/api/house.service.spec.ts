import {TestBed} from '@angular/core/testing';

import {HouseService} from '@core/services';

describe('HouseService', () => {
    let service: HouseService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(HouseService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
});
