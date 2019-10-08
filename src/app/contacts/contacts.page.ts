import {Component} from '@angular/core';
import {NavController, ModalController} from '@ionic/angular';
import {QRScanner, QRScannerStatus} from '@ionic-native/qr-scanner/ngx';
import {
  AuthenticationService, DataService, KiosksModel,
  AssignKiosksModel, APIService, AssignKiosksService, KiosksStatusService,
} from '../_services/authentication.service';
import {KiosksAssign, User} from '../_models';

@Component({
  selector: 'app-contacts',
  templateUrl: 'contacts.page.html',
  styleUrls: ['contacts.page.scss']
})
export class ContactsPage {
  public user = new User({});
  public users = [];
  public kiosksmodel = new KiosksModel();


  constructor(public navCtrl: NavController,
              private authenticationService: AuthenticationService, public dataService: DataService,
              public apiService: APIService) {
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
    if (this.kiosksmodel && this.kiosksmodel.governorate && this.kiosksmodel.governorate.name === 'All') {
      this.dataService.getUserStatusByAll(this.kiosksmodel.pollingstation).subscribe(() => {
        console.log('completed');
      }, () => {
        console.log('errors');
      });
    } else if (this.kiosksmodel && this.kiosksmodel.governorate && this.kiosksmodel.governorate.name !== 'All' &&
      this.kiosksmodel.wilayat.name === 'All') {
      this.dataService.getUserStatusByGovernorateId(this.kiosksmodel.governorate.code,
        this.kiosksmodel.pollingstation).subscribe(() => {
        console.log('completed');
      }, () => {
        console.log('errors');
      });
    } else if (this.kiosksmodel && this.kiosksmodel.governorate && this.kiosksmodel.governorate.name !== 'All'
      && this.kiosksmodel.wilayat && this.kiosksmodel.wilayat.code !== 'All') {
      this.dataService.getUserstatusByWilayatId(this.kiosksmodel.wilayat.code,
        this.kiosksmodel.pollingstation).subscribe(() => {
        console.log('completed');
      }, () => {
        console.log('errors');
      });
    }
    this.navCtrl.navigateRoot(url);
  }
}
