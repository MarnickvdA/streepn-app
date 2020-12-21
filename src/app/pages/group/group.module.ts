import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';

import {IonicModule} from '@ionic/angular';

import {GroupPageRoutingModule} from './group-routing.module';

import {GroupPage} from './group.page';
import {TranslateModule} from '@ngx-translate/core';
import {AddTransactionComponent} from './add-transaction/add-transaction.component';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        IonicModule,
        GroupPageRoutingModule,
        TranslateModule
    ],
    declarations: [
        GroupPage,
        AddTransactionComponent
    ]
})
export class GroupPageModule {
}
