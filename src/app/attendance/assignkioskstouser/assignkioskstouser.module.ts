import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';

import {AssignkioskstouserPage} from './assignkioskstouser.page';
import {SharedModule} from '../../shared/shared.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    SharedModule,
    RouterModule.forChild([
      {
        path: '',
        component: AssignkioskstouserPage
      }
    ])
  ],
  declarations: [AssignkioskstouserPage]
})
export class AssignkioskstouserModule {}
