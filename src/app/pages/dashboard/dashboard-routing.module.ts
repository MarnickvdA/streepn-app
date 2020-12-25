import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';

import {DashboardPage} from './dashboard.page';
import {NewGroupComponent} from './new-group/new-group.component';

const routes: Routes = [
    {
        path: '',
        component: DashboardPage
    },
    {
        path: 'new-group',
        component: NewGroupComponent
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class DashboardPageRoutingModule {
}
