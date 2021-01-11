import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { SharedAccountDetailPage } from './shared-account-detail.page';

describe('SharedAccountDetailPage', () => {
  let component: SharedAccountDetailPage;
  let fixture: ComponentFixture<SharedAccountDetailPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SharedAccountDetailPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(SharedAccountDetailPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
