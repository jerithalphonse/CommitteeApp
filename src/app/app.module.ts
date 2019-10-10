import {NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';
import {RouteReuseStrategy} from '@angular/router';

import {IonicModule, IonicRouteStrategy, ModalController} from '@ionic/angular';
import {SplashScreen} from '@ionic-native/splash-screen/ngx';
import {StatusBar} from '@ionic-native/status-bar/ngx';

import {HttpClientModule, HTTP_INTERCEPTORS, HttpClient} from '@angular/common/http';
import {AppComponent} from './app.component';
import {AppRoutingModule} from './app-routing.module';
import {ErrorInterceptor, JwtInterceptor} from './_helpers';
import {NetworkService} from './_services/network.service';
import {createTranslateLoader, SharedModule} from './shared/shared.module';
import {QRScanner} from '@ionic-native/qr-scanner/ngx';
import {ImagePicker} from '@ionic-native/image-picker/ngx';
// import { Camera } from '@ionic-native/camera/ngx';
import { CameraPreview, CameraPreviewPictureOptions, CameraPreviewOptions,
  CameraPreviewDimensions } from '@ionic-native/camera-preview/ngx';
import {TranslateLoader, TranslateModule} from '@ngx-translate/core';
import {Network} from '@ionic-native/network/ngx';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
@NgModule({
  declarations: [AppComponent],
  entryComponents: [],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    IonicModule.forRoot(),
    AppRoutingModule,
    SharedModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: (createTranslateLoader),
        deps: [HttpClient]
      }
    }),
  ],
  providers: [
    StatusBar,
    SplashScreen,
    NetworkService,
    QRScanner,
    ImagePicker,
    // Camera,
    CameraPreview,
    Network,
    {provide: RouteReuseStrategy, useClass: IonicRouteStrategy},
    {provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true},
    {provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true},

    // provider used to create fake backend
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
}
