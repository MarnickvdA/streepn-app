import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { HousePage } from './house.page';

describe('HousePage', () => {
  let component: HousePage;
  let fixture: ComponentFixture<HousePage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HousePage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(HousePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
