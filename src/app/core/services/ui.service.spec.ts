import {TestBed} from '@angular/core/testing';

import {UIService} from './ui.service';
import {TranslationModule} from '../../translation.module';
import {HttpClientModule} from '@angular/common/http';

describe('UIService', () => {
    let service: UIService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [TranslationModule.forRoot(), HttpClientModule]
        });
        service = TestBed.inject(UIService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
});
