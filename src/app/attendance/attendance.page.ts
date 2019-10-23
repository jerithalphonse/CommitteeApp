import {Component, OnInit} from '@angular/core';
import {AttendanceStatusService, AuthenticationService, DataService, KiosksModel} from '../_services/authentication.service';
import {NavController, MenuController, LoadingController} from '@ionic/angular';
import {User} from '../_models';
import { AlertController } from '@ionic/angular';

@Component({
  selector: 'app-attendance',
  templateUrl: 'attendance.page.html',
  styleUrls: ['attendance.page.scss']
})
export class AttendancePage implements OnInit {
  public user = new User({});
  public kiosksmodel = new KiosksModel();
  public redirector = 'voting';

  constructor(private authenticationService: AuthenticationService, public dataService: DataService,
              public alertController: AlertController,  public navCtrl: NavController,  public attendanceStatusService: AttendanceStatusService ) {
    this.kiosksmodel.currentTab = 'voting';
    this.authenticationService.currentUser.subscribe(value => {
      this.user = value;
      if (this.user && this.user.roles && this.user.roles.name !== 'high_committee' && this.user.roles.name !== 'main_committee' && this.user.roles.name !== 'wali_officer' && this.user.roles.name !== 'wali_assistant') {
        if (this.user.roles.name === 'committee_head_voting') {
          this.redirector = 'assigned';
        } else {
          this.redirector = 'any';
        }
      }
    });
    this.dataService.currentDataService.subscribe(value => {
      this.kiosksmodel = value;
    });
  }

  ngOnInit() {
    this.kiosksmodel.show.resetView({});
  }
  getAttendanceStatusAll(type: string) {
    // this.attendanceStatusService.getKiosksLockedStats(this.kiosksmodel.wilayat.code);
    this.attendanceStatusService.getAttendanceStatusAll(
      this.kiosksmodel.pollingstation, type, this.kiosksmodel.assigned).subscribe(() => {
    }, (errors) => {
      // TODO Handle errors for not finding any kiosks
    });
  }
  getAttendanceStatusByGovernorateId(type: string) {
    // this.attendanceStatusService.getKiosksLockedStats(this.kiosksmodel.wilayat.code);
    this.attendanceStatusService.getAttendanceStatusByGovernorateId(this.kiosksmodel.governorate.code,
      this.kiosksmodel.pollingstation, type, this.kiosksmodel.assigned).subscribe(() => {
    }, (errors) => {
      // TODO Handle errors for not finding any kiosks
    });
  }
  getAttendanceStatusByWilayatId(type: string) {
    // this.attendanceStatusService.getKiosksLockedStats(this.kiosksmodel.wilayat.code);
    this.attendanceStatusService.getAttendanceStatusByWilayatId(this.kiosksmodel.wilayat.code,
      this.kiosksmodel.pollingstation, type, this.kiosksmodel.assigned).subscribe(() => {
    }, (errors) => {
      // TODO Handle errors for not finding any kiosks
    });
  }
  getRoleType() {
    if (this.user.roles && (this.user.roles.name === 'committee_head_voting' || this.user.roles.name === 'high_committee' ||
      this.user.roles.name === 'main_committee' ||
      this.user.roles.name === 'wali_officer' ||
      this.user.roles.name === 'wali_assistant' ||
      this.user.roles.name === 'polling_station_supervisor_voting')) {
      return 'voting';
    } else if (this.user.roles && this.user.roles.name === 'committee_head_counting' ||
      this.user.roles.name === 'polling_station_supervisor_counting') {
      return 'counting';
    } else if (this.user.roles && this.user.roles.name === 'committee_head_organizing' ||
      this.user.roles.name === 'polling_station_supervisor_organizing') {
      return 'organizing';
    }
  }
  goto(url: string) {
    if (this.kiosksmodel && this.kiosksmodel.governorate && this.kiosksmodel.governorate.name === 'All') {
      this.kiosksmodel.changeTab(this.getRoleType(),
        this.redirector === 'assigned' ? 'assigned' : 'any');
      this.getAttendanceStatusAll(this.kiosksmodel.currentTab);
    } else if (this.kiosksmodel && this.kiosksmodel.governorate && this.kiosksmodel.governorate.name !== 'All' &&
      this.kiosksmodel.wilayat.name === 'All') {
      this.kiosksmodel.changeTab(this.getRoleType(),
        this.redirector === 'assigned' ? 'assigned' : 'any');
      this.getAttendanceStatusByGovernorateId(this.kiosksmodel.currentTab);
    } else if (this.kiosksmodel && this.kiosksmodel.governorate && this.kiosksmodel.governorate.name !== 'All'
      && this.kiosksmodel.wilayat && this.kiosksmodel.wilayat.code !== 'All') {
      this.kiosksmodel.changeTab(this.getRoleType(),
        this.redirector === 'assigned' ? 'assigned' : 'any');
      this.getAttendanceStatusByWilayatId(this.kiosksmodel.currentTab);
    }
    this.navCtrl.navigateRoot(url + this.redirector);
  }
}
