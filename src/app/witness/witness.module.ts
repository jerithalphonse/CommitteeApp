import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';

import {WitnessPage} from './witness.page';
import {SharedModule} from '../shared/shared.module';
import {WitnessStatusPage} from './witness.status.page';
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
        component: WitnessPage
      },
      {
        path: 'witnessstatus',
        component: WitnessStatusPage
      }
    ])
  ],
  declarations: [WitnessPage, WitnessStatusPage]
})
export class WitnessModule {}
