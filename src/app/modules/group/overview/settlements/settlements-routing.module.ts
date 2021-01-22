import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { SettlementsPage } from './settlements.page';

const routes: Routes = [
  {
    path: '',
    component: SettlementsPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SettlementsPageRoutingModule {}
