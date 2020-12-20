import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { GroupSettingsPageRoutingModule } from './group-settings-routing.module';

import { GroupSettingsPage } from './group-settings.page';
import {TranslateModule} from '@ngx-translate/core';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        IonicModule,
        GroupSettingsPageRoutingModule,
        TranslateModule
    ],
  declarations: [GroupSettingsPage]
})
export class GroupSettingsPageModule {}
