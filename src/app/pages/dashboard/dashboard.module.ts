import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';

import {IonicModule} from '@ionic/angular';

import {DashboardPageRoutingModule} from './dashboard-routing.module';

import {DashboardPage} from './dashboard.page';
import {TranslateModule} from '@ngx-translate/core';
import {OnboardingComponent} from './onboarding/onboarding.component';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        IonicModule,
        DashboardPageRoutingModule,
        TranslateModule,
        ReactiveFormsModule
    ],
    declarations: [DashboardPage, OnboardingComponent]
})
export class DashboardPageModule {
}
