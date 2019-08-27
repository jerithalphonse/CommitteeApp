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
      if (this.user && this.user.roles && this.user.roles.id !== 1) {
        this.redirector = 'assigned';
      }
    });
    this.dataService.currentDataService.subscribe(value => {
      this.kiosksmodel = value;
    });
  }

  ngOnInit() {
    this.kiosksmodel.show.resetView({});
  }
  getAttendanceStatus(type: string) {
    // this.attendanceStatusService.getKiosksLockedStats(this.kiosksmodel.wilayat.code);
    this.attendanceStatusService.getAttendanceStatusByWilayatId(this.kiosksmodel.wilayat.code,
      this.kiosksmodel.pollingstation, type, this.kiosksmodel.assigned).subscribe(() => {
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
      this.getAttendanceStatus(this.kiosksmodel.currentTab);
    }
    this.navCtrl.navigateRoot(url);
  }
}
