import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';

import {MessagingPage} from './messaging.page';
import {SharedModule} from '../shared/shared.module';
import {MessagingStatusPage} from './messaging.status.page';
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
        path: 'chatsample',
        component: ChatComponent
      }
      // {
      //   path: 'messages',
      //   component: MessagingTypeHandlerPage,
      //   children : [
      //     { path: 'allmembers', component: SendMessagePage },
      //     { path: 'committeehead', component: SendMessagePage },
      //     { path: 'waliofficers', component: SendMessagePage },
      //     { path: 'toheadcommittee', component: SendMessagePage },
      //     { path: 'checkmessages', component: SendMessagePage },
      //     { path: 'sendmessages', component: SendMessagePage },
      //   ]
      // }
    ])
  ],
  declarations: [MessagingPage, MessagingStatusPage]
})
export class MessagingModule {}
