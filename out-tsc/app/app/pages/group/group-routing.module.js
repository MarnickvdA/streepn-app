import { __decorate } from "tslib";
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { GroupPage } from './group.page';
const routes = [
    {
        path: '',
        component: GroupPage
    }
];
let GroupPageRoutingModule = class GroupPageRoutingModule {
};
GroupPageRoutingModule = __decorate([
    NgModule({
        imports: [RouterModule.forChild(routes)],
        exports: [RouterModule],
    })
], GroupPageRoutingModule);
export { GroupPageRoutingModule };
//# sourceMappingURL=group-routing.module.js.map