import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { StockLogPage } from './stock-log.page';

const routes: Routes = [
  {
    path: '',
    component: StockLogPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class StockLogPageRoutingModule {}
