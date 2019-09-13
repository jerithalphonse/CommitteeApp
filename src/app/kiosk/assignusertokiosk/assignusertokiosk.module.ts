import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';

import {AssignUserToKioskPage} from './assignusertokiosk.page';
import {SharedModule} from '../../shared/shared.module';
import {TranslateModule} from '@ngx-translate/core';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    SharedModule,
    TranslateModule,
    RouterModule.forChild([
      {
        path: '',
        component: AssignUserToKioskPage
      }
    ])
  ],
  declarations: [AssignUserToKioskPage]
})
export class AssignUserToKiosksModule {}
