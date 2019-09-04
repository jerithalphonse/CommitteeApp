import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';

import {MessagingPage} from './messaging.page';
import {SharedModule} from '../shared/shared.module';
import {ChatComponent} from '../shared/chat/chat.component';


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    SharedModule,
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
