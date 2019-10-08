import {Component} from '@angular/core';
import {NavController, ModalController} from '@ionic/angular';
import {QRScanner, QRScannerStatus} from '@ionic-native/qr-scanner/ngx';
import {
  AuthenticationService, DataService, KiosksModel,
  AssignKiosksModel, APIService, AssignKiosksService,
} from '../_services/authentication.service';
import {KiosksAssign, User} from '../_models';
import {error} from 'selenium-webdriver';

@Component({
  selector: 'app-contacts-status',
  templateUrl: 'contacts.status.page.html',
  styleUrls: ['contacts.status.page.scss']
})
export class ContactStatusPage {
  public user = new User({});
  public users = [];
  public kiosksmodel = new KiosksModel();
  public itemopened = false;


  constructor(public navCtrl: NavController,
              private authenticationService: AuthenticationService, public dataService: DataService,
              public apiService: APIService, public assignkiosksservice: AssignKiosksService) {
    this.authenticationService.currentUser.subscribe(value => {
      this.user = value;
    });
    this.dataService.currentDataService.subscribe(value => {
      this.kiosksmodel = value;
    });
  }


  ionViewWillEnter() {
  }

  goto(url: string) {
    this.navCtrl.navigateRoot(url);
  }

}
