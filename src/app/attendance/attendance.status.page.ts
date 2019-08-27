import {Component, OnInit} from '@angular/core';
import {AttendanceStatusService, AuthenticationService, DataService, KiosksModel} from '../_services/authentication.service';
import {NavController, MenuController, LoadingController} from '@ionic/angular';
import {User} from '../_models';
import {AlertController} from '@ionic/angular';

@Component({
  selector: 'app-attendance-status',
  templateUrl: 'attendance.status.page.html',
  styleUrls: ['attendance.status.scss']
})
export class AttendanceStatusPage implements OnInit {
  public user = new User({});
  public kiosksmodel = new KiosksModel();

  constructor(private authenticationService: AuthenticationService, public dataService: DataService,
              public alertController: AlertController, public navCtrl: NavController, public attendanceStatusService: AttendanceStatusService) {
    this.authenticationService.currentUser.subscribe(value => {
      this.user = value;
    });
    this.dataService.currentDataService.subscribe(value => {
      this.kiosksmodel = value;
      this.attendanceStatusService.updatePollingStationKeys(this.kiosksmodel.pollingstations);
    });
  }

  ngOnInit() {
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

  changeTab(type: string, assigned: string) {
    if (!type) {
      type = this.getRoleType();
    }
    this.kiosksmodel.changeTab(type, assigned);
    this.attendanceStatusService.getAttendanceStatusByWilayatId(this.kiosksmodel.wilayat.code, this.kiosksmodel.pollingstation,
      type, assigned).subscribe(() => {
      console.log('completed');
    }, () => {
      console.log('errors');
    });
  }

  goto() {
    this.navCtrl.navigateRoot('/kiosk/assigned');
  }
}
