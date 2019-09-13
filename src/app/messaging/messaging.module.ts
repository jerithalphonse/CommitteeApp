import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';

import {MessagingPage} from './messaging.page';
import {SharedModule} from '../shared/shared.module';
import {ChatComponent} from '../shared/chat/chat.component';
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
        component: MessagingPage,
      },
      {
        path: 'chat/:name',
        component: ChatComponent
      }
    ])
  ],
  declarations: [MessagingPage]
})
export class MessagingModule {}
