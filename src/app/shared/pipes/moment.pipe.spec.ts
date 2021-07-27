import {MomentPipe} from './moment.pipe';
import {TestBed, waitForAsync} from '@angular/core/testing';
import {TranslateTestingModule} from 'ngx-translate-testing';

describe('MomentPipe', () => {

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            imports: [TranslateTestingModule]
        }).compileComponents();
    }));

    it('create an instance', () => {
        const pipe = new MomentPipe();
        expect(pipe).toBeTruthy();
    });
});
