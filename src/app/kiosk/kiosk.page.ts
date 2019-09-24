import {Component, OnInit} from '@angular/core';
import {AuthenticationService, DataService, KiosksModel, KiosksStatusService} from '../_services/authentication.service';
import {NavController, MenuController, LoadingController} from '@ionic/angular';
import {User} from '../_models';
import { AlertController } from '@ionic/angular';

@Component({
  selector: 'app-kiosk',
  templateUrl: 'kiosk.page.html',
  styleUrls: ['kiosk.page.scss']
})
export class KioskPage implements OnInit {
  public user = new User({});
  public kiosksmodel = new KiosksModel();
  public redirector = 'assigned';

  constructor(private authenticationService: AuthenticationService, public dataService: DataService,
              public alertController: AlertController,  public navCtrl: NavController, private kiosksStatusService: KiosksStatusService) {
    this.kiosksmodel.currentTab = 'assigned';
    this.authenticationService.currentUser.subscribe(value => {
      this.user = value;
      if (this.user && this.user.roles && this.user.roles.name !== 'head_committee') {
        let temp = this.getRoleType();
        this.redirector = temp === 'voting' ? 'assigned' : 'any';
      }
    });
    this.dataService.currentDataService.subscribe(value => {
      this.kiosksmodel = value;
    });
  }

  ngOnInit() {
    this.kiosksmodel.show.resetView({});
  }
  getKiosksStatus(type: string) {

  }
  getRoleType() {
    if (this.user.roles && (this.user.roles.name === 'committee_head_voting' || this.user.roles.name === 'head_committee' ||
      this.user.roles.name === 'polling_station_supervisor_voting')) {
      return 'voting';
    } else if (this.user.roles && this.user.roles.name === 'committee_head_counting_organizing' ||
      this.user.roles.name === 'polling_station_supervisor_couting_organizing') {
      return 'counting';
    }
  }
  goto(url: string) {
    if (this.kiosksmodel && this.kiosksmodel.governorate && this.kiosksmodel.governorate.name === 'All') {
      this.kiosksmodel.changeTab(this.getRoleType(),
        this.redirector === 'assigned' ? 'assigned' : 'any');
      this.kiosksStatusService.getKiosksStatusAll(this.kiosksmodel.pollingstation, this.redirector,
        this.kiosksmodel.assigned).subscribe(() => {
        console.log('completed');
      }, (errors) => {
        console.log('errors');
      });
    } else if (this.kiosksmodel && this.kiosksmodel.governorate && this.kiosksmodel.governorate.name !== 'All' &&
      this.kiosksmodel.wilayat.name === 'All') {
      this.kiosksmodel.changeTab(this.getRoleType(),
        this.redirector === 'assigned' ? 'assigned' : 'any');
      this.kiosksStatusService.getKiosksStatusByGovernorateId(this.kiosksmodel.governorate.code, this.kiosksmodel.pollingstation,
        this.redirector, this.kiosksmodel.assigned).subscribe(() => {
        console.log('completed');
      }, (errors) => {
        console.log('errors');
      });
    } else if (this.kiosksmodel && this.kiosksmodel.governorate && this.kiosksmodel.governorate.name !== 'All'
      && this.kiosksmodel.wilayat && this.kiosksmodel.wilayat.code !== 'All') {
      this.kiosksmodel.changeTab(this.getRoleType(),
        this.redirector === 'assigned' ? 'assigned' : 'any');
      this.kiosksStatusService.getKiosksStatusByWilayatId(this.kiosksmodel.wilayat.code, this.kiosksmodel.pollingstation, this.redirector,
        this.kiosksmodel.assigned).subscribe(() => {
          console.log('completed');
      }, (errors) => {
          console.log('errors');
      });
    }
    this.navCtrl.navigateRoot(url);
  }
}
