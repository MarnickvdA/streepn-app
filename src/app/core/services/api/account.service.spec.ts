import {TestBed} from '@angular/core/testing';

import {AccountService} from '@core/services';

describe('AccountService', () => {
    let service: AccountService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(AccountService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
});
