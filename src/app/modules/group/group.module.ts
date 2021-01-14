import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';

import {IonicModule} from '@ionic/angular';
import {GroupPage} from '@modules/group/group.page';
import {GroupPageRoutingModule} from '@modules/group/group-routing.module';
import {TranslateModule} from '@ngx-translate/core';
import {AddTransactionComponent} from '@modules/group/add-transaction/add-transaction.component';
import {FontAwesomeModule} from '@fortawesome/angular-fontawesome';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        IonicModule,
        GroupPageRoutingModule,
        TranslateModule,
        FontAwesomeModule
    ],
    declarations: [
        GroupPage,
        AddTransactionComponent
    ]
})
export class GroupPageModule {
}
