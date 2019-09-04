import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {IonicModule} from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { PhotoViewer } from '@ionic-native/photo-viewer/ngx';

import { SelectGovernorateComponent } from './selectgovernorate';
import {ChatService} from './chat/chat-service';
import {ChatComponent, DateConvert} from './chat/chat.component';
@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule
  ],
  declarations: [SelectGovernorateComponent, ChatComponent, DateConvert],
  exports: [
    SelectGovernorateComponent
  ], providers: [PhotoViewer, ChatService]
})
export class SharedModule {}
