import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';

import {DashboardPage} from './dashboard.page';
import {NewHouseComponent} from './new-house/new-house.component';

const routes: Routes = [
    {
        path: '',
        component: DashboardPage
    },
    {
        path: 'new-house',
        component: NewHouseComponent
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class DashboardPageRoutingModule {
}
