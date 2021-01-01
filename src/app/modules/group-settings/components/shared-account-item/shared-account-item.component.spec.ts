import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { SharedAccountItemComponent } from './shared-account-item.component';

describe('SharedAccountItemComponent', () => {
  let component: SharedAccountItemComponent;
  let fixture: ComponentFixture<SharedAccountItemComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SharedAccountItemComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(SharedAccountItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
