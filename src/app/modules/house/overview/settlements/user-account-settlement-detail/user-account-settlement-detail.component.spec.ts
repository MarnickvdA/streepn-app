import {ComponentFixture, TestBed, waitForAsync} from '@angular/core/testing';
import {IonicModule} from '@ionic/angular';

import {UserAccountSettlementDetailComponent} from './user-account-settlement-detail.component';

describe('UserAccountSettlementDetailComponent', () => {
  let component: UserAccountSettlementDetailComponent;
  let fixture: ComponentFixture<UserAccountSettlementDetailComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ UserAccountSettlementDetailComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(UserAccountSettlementDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
