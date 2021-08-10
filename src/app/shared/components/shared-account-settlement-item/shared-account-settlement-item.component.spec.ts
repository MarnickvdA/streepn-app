import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { SharedAccountSettlementItemComponent } from './shared-account-settlement-item.component';

describe('SharedAccountSettlementItemComponent', () => {
  let component: SharedAccountSettlementItemComponent;
  let fixture: ComponentFixture<SharedAccountSettlementItemComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ SharedAccountSettlementItemComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(SharedAccountSettlementItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
