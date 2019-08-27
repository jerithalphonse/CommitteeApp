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
  public redirector = 'voting';

  constructor(private authenticationService: AuthenticationService, public dataService: DataService,
              public alertController: AlertController,  public navCtrl: NavController, private kiosksStatusService: KiosksStatusService) {
    this.kiosksmodel.currentTab = 'voting';
    this.authenticationService.currentUser.subscribe(value => {
      this.user = value;
      if (this.user && this.user.roles && this.user.roles.id !== 1) {
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
    // this.attendanceStatusService.getKiosksLockedStats(this.kiosksmodel.wilayat.code);
    // this.attendanceStatusService.getAttendanceStatusByWilayatId(this.kiosksmodel.wilayat.code, this.kiosksmodel.pollingstation, type, this.kiosksmodel.assigned);
    // this.kiosksStatusService.getKiosksLockedStats(this.kiosksmodel.wilayat.code);
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
  goto(url: string) {
    if (this.kiosksmodel && this.kiosksmodel.wilayat && this.kiosksmodel.wilayat.code) {
      this.kiosksmodel.changeTab(this.getRoleType(),
        this.redirector === 'assigned' ? 'assigned' : 'any');
      this.getKiosksStatus(this.kiosksmodel.currentTab);
    }
    this.navCtrl.navigateRoot(url);
  }
}
