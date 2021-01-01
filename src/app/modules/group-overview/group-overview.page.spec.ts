import {async, ComponentFixture, TestBed} from '@angular/core/testing';
import {IonicModule} from '@ionic/angular';

import {GroupOverviewPage} from './group-overview.page';

describe('GroupOverviewPage', () => {
    let component: GroupOverviewPage;
    let fixture: ComponentFixture<GroupOverviewPage>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [GroupOverviewPage],
            imports: [IonicModule.forRoot()]
        }).compileComponents();

        fixture = TestBed.createComponent(GroupOverviewPage);
        component = fixture.componentInstance;
        fixture.detectChanges();
    }));

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
