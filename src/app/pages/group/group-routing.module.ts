import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';

import {GroupPage} from './group.page';

const routes: Routes = [
    {
        path: ':id',
        children: [
            {
                path: '',
                pathMatch: 'full',
                component: GroupPage,
            },
            {
                path: 'settings',
                loadChildren: () => import('../group-settings/group-settings.module').then(m => m.GroupSettingsPageModule)
            }
        ]
    },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class GroupPageRoutingModule {
}
