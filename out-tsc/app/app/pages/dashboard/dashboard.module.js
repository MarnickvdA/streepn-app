import { __decorate } from "tslib";
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { DashboardPageRoutingModule } from './dashboard-routing.module';
import { DashboardPage } from './dashboard.page';
let DashboardPageModule = class DashboardPageModule {
};
DashboardPageModule = __decorate([
    NgModule({
        imports: [
            CommonModule,
            FormsModule,
            IonicModule,
            DashboardPageRoutingModule
        ],
        declarations: [DashboardPage]
    })
], DashboardPageModule);
export { DashboardPageModule };
//# sourceMappingURL=dashboard.module.js.map