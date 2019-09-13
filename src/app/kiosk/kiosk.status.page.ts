import {Component, OnInit} from '@angular/core';
import {AuthenticationService, DataService, KiosksModel, KiosksStatusService} from '../_services/authentication.service';
import {NavController, MenuController, LoadingController} from '@ionic/angular';
import {User} from '../_models';
import { AlertController } from '@ionic/angular';

@Component({
  selector: 'app-kiosk-status',
  templateUrl: 'kiosk.status.page.html',
  styleUrls: ['kiosk.status.scss']
})
export class KioskStatusPage implements OnInit {
  public user = new User({});
  public kiosksmodel = new KiosksModel();
  public redirector = 'voting';

  constructor(private authenticationService: AuthenticationService, public dataService: DataService,
              public alertController: AlertController,  public navCtrl: NavController, public kiosksStatusService: KiosksStatusService) {
    this.authenticationService.currentUser.subscribe(value => {
      this.user = value;
      if (this.user && this.user.roles && this.user.roles.name !== 'head_committee') {
        this.redirector = 'assigned';
      }
    });
    this.dataService.currentDataService.subscribe(value => {
      this.kiosksmodel = value;
      this.kiosksStatusService.updatePollingStationKeys(this.kiosksmodel.pollingstations);
    });
  }

  ngOnInit() {
    this.kiosksmodel.show.resetView({});
  }
  getKiosksStatus(type: string) {
    this.kiosksStatusService.getKiosksStatusByWilayatId(this.kiosksmodel.wilayat.code, this.kiosksmodel.pollingstation, type,
      this.kiosksmodel.assigned).subscribe(() => {

    }, (errors) => {
      // TODO Handle errors for not finding any kiosks
    });
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
  changeTab(type: string) {
    this.kiosksmodel.changeTab(this.getRoleType(), type);
    this.getKiosksStatus(this.getRoleType());
  }

  goto(url: string) {
    if (this.kiosksmodel && this.kiosksmodel.wilayat && this.kiosksmodel.wilayat.code) {
      this.kiosksmodel.changeTab(this.getRoleType(),
        this.redirector === 'assigned' ? 'assigned' : 'any');
      this.getKiosksStatus(this.kiosksmodel.currentTab);
    }
    this.navCtrl.navigateRoot(url);
  }
}
