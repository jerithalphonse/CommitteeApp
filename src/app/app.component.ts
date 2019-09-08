import {Component} from '@angular/core';

import {LoadingController, MenuController, NavController, Platform} from '@ionic/angular';
import {SplashScreen} from '@ionic-native/splash-screen/ngx';
import {StatusBar} from '@ionic-native/status-bar/ngx';
import {AuthenticationService} from './_services/authentication.service';
import {User} from './_models';
import * as firebase from 'firebase';

const config = {
  apiKey: 'AIzaSyDHhSWHdykCVNwmpJxGIpwZ-Dk4Crofo7I',
  authDomain: 'imtac-sample.firebaseapp.com',
  databaseURL: 'https://imtac-sample.firebaseio.com',
  projectId: 'imtac-sample',
  storageBucket: 'imtac-sample.appspot.com',
  messagingSenderId: '641927161072',
  appId: '1:641927161072:web:922d50f2fbf0d128'
};

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html'
})
export class AppComponent {
  public toggleedit = false;
  public toggleeditemail = false;
  public toggleeditmobile = false;
  public user = new User({});

  constructor(
    private platform: Platform,
    private splashScreen: SplashScreen,
    private statusBar: StatusBar,
    private authenticationService: AuthenticationService,
    public navCtrl: NavController,
    public loadingCtrl: LoadingController) {
    this.initializeApp();
  }

  initializeApp() {
    this.splashScreen.show();
    this.platform.ready().then(() => {
      this.statusBar.styleDefault();
      this.splashScreen.hide();
      this.authenticationService.currentUser.subscribe(value => {
        this.user = value;
        console.log(this.user);
      });
    });
    firebase.initializeApp(config);
  }

  toggleEdit() {
    if (this.toggleedit) {
      this.authenticationService.updateUser(this.user).subscribe(() => {});
    }
    this.toggleedit = !this.toggleedit;
  }

  toggleEmailEdit() {
    if (this.toggleeditemail) {
      this.authenticationService.updateUser(this.user).subscribe(() => {});
    }
    this.toggleeditemail = !this.toggleeditemail;
  }

  togglePhoneEdit() {
    if (this.toggleeditmobile) {
      this.authenticationService.updateUser(this.user).subscribe(() => {});
    }
    this.toggleeditmobile = !this.toggleeditmobile;
  }

  uploadImage() {
    this.authenticationService.getImageFromPicker((blob) => {
      let formData = new FormData();
      formData.append('files', blob, 'profile_picture' + Math.random() + '.png');
      this.authenticationService.uploadImage(formData, (data) => {
        if (data && data.filesUploaded && data.filesUploaded.length) {
          this.user.imageUrl = data.filesUploaded[0];
        } else {
          // TODO sorry couldnt upload the file
        }
      });
    });
  }

  async logout() {
    const dismissLoader = (res) => {
      res.dismiss();
      res.onDidDismiss().then((dis) => {
        console.log('Loading dismissed!');
      });
    };
    const authFunc = (res) => {
      this.authenticationService.logout();
      this.navCtrl.navigateRoot('/login');
      dismissLoader(res);
    };
    const loader = await this.loadingCtrl.create({
      message: 'Sign in you up'
    }).then((res) => {
      res.present();
      authFunc(res);
    });
  }
}
