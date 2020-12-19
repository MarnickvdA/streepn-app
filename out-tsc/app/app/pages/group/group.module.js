import { __decorate } from "tslib";
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { GroupPageRoutingModule } from './group-routing.module';
import { GroupPage } from './group.page';
let GroupPageModule = class GroupPageModule {
};
GroupPageModule = __decorate([
    NgModule({
        imports: [
            CommonModule,
            FormsModule,
            IonicModule,
            GroupPageRoutingModule
        ],
        declarations: [GroupPage]
    })
], GroupPageModule);
export { GroupPageModule };
//# sourceMappingURL=group.module.js.map