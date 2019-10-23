import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {IonicModule} from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { PhotoViewer } from '@ionic-native/photo-viewer/ngx';

import { IonicStorageModule } from '@ionic/storage';
import { HttpClient } from '@angular/common/http';
import { TranslateModule} from '@ngx-translate/core';
import { TranslateHttpLoader} from '@ngx-translate/http-loader';

export function createTranslateLoader(http: HttpClient) {
  return new TranslateHttpLoader(http, 'assets/i18n/', '.json');
}

import { SelectGovernorateComponent } from './selectgovernorate';
import {ChatService} from './chat/chat-service';
import {ChatComponent, DateConvert} from './chat/chat.component';
import {LanguagePopoverPage} from './language.popover.page';
import {LanguageService} from '../_services/language.service';
import {CameraComponent} from './camera/camera.component';
import { UserNameDirectiveComponent} from './username/user.directive';
@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    IonicStorageModule.forRoot(),
    TranslateModule
  ],
  entryComponents: [LanguagePopoverPage],
  declarations: [SelectGovernorateComponent, ChatComponent, DateConvert, LanguagePopoverPage, CameraComponent, UserNameDirectiveComponent],
  exports: [
    SelectGovernorateComponent,
    DateConvert,
    UserNameDirectiveComponent,
    CameraComponent,
    LanguagePopoverPage,
    TranslateModule
  ], providers: [PhotoViewer, ChatService, LanguageService]
})
export class SharedModule {}
