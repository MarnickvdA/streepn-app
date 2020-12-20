import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { GroupSettingsPage } from './group-settings.page';

const routes: Routes = [
  {
    path: '',
    component: GroupSettingsPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class GroupSettingsPageRoutingModule {}
