import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { SharedAccountSettlementDetailComponent } from './shared-account-settlement-detail.component';

describe('SharedAccountSettlementDetailComponent', () => {
  let component: SharedAccountSettlementDetailComponent;
  let fixture: ComponentFixture<SharedAccountSettlementDetailComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ SharedAccountSettlementDetailComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(SharedAccountSettlementDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
