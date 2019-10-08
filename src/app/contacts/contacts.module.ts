import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';

import {ContactStatusPage} from './contacts.status.page';
import { ContactsPage} from './contacts.page';
import {SharedModule} from '../shared/shared.module';
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
        component: ContactsPage
      },
      {
        path: 'list',
        component: ContactStatusPage
      }
    ])
  ],
  declarations: [ContactStatusPage, ContactsPage]
})
export class ContactsModule {}
