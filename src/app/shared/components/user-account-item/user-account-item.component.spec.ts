import {async, ComponentFixture, TestBed} from '@angular/core/testing';
import {IonicModule} from '@ionic/angular';

import {UserAccountItemComponent} from './user-account-item.component';

describe('UserAccountItemComponent', () => {
    let component: UserAccountItemComponent;
    let fixture: ComponentFixture<UserAccountItemComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [UserAccountItemComponent],
            imports: [IonicModule.forRoot()]
        }).compileComponents();

        fixture = TestBed.createComponent(UserAccountItemComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    }));

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
