import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';

import {IonicModule} from '@ionic/angular';

import {DashboardPageRoutingModule} from './dashboard-routing.module';

import {DashboardPage} from './dashboard.page';
import {TranslateModule} from '@ngx-translate/core';
import {OnboardingComponent} from './onboarding/onboarding.component';
import {NewGroupComponent} from './new-group/new-group.component';
import {SharedModule} from '../../shared/shared.module';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        IonicModule,
        DashboardPageRoutingModule,
        TranslateModule,
        ReactiveFormsModule,
        SharedModule
    ],
    declarations: [DashboardPage, OnboardingComponent, NewGroupComponent]
})
export class DashboardPageModule {
}
