import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { DealsPage } from './deals.page';

describe('DealsPage', () => {
  let component: DealsPage;
  let fixture: ComponentFixture<DealsPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DealsPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(DealsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
