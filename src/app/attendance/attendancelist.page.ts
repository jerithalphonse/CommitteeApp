import {Component, OnInit} from '@angular/core';
import {
  AttendanceStatusModel,
  AttendanceStatusService,
  AuthenticationService,
  DataService,
  KiosksModel, KiosksStatusService
} from '../_services/authentication.service';
import {NavController, MenuController, LoadingController} from '@ionic/angular';
import {User} from '../_models';
import {AlertController} from '@ionic/angular';

@Component({
  selector: 'app-attendance-list',
  templateUrl: 'attendancelist.page.html',
  styleUrls: ['attendance.status.scss']
})
export class AttendancelistPage implements OnInit {
  public user = new User({});
  public kiosksmodel = new KiosksModel();
  public attendancestatus = new AttendanceStatusModel({});
  customPSOptions: any = {
    header: 'Select a Polling Station',
    translucent: true
  };

  constructor(private authenticationService: AuthenticationService, public dataService: DataService,
              public alertController: AlertController, public navCtrl: NavController,
              public attendanceStatusService: AttendanceStatusService) {
    this.authenticationService.currentUser.subscribe(value => {
      this.user = value;
    });
    this.dataService.currentDataService.subscribe(value => {
      this.kiosksmodel = value;
    });
    this.attendanceStatusService.currentDataService.subscribe(value => {
      this.attendancestatus = value;
    });
  }

  ngOnInit() {
  }

  onChangePollingStation(event) {
    this.dataService.onChangePollingStation(event);
    setTimeout(() => {
      this.attendanceStatusService.getAttendanceStatusByWilayatId(this.kiosksmodel.wilayat.code,
        this.kiosksmodel.pollingstation, this.kiosksmodel.currentTab, this.kiosksmodel.assigned).subscribe(() => {
      }, (errors) => {
        // TODO Handle errors for not finding any kiosks
      });
    }, 100);
  }

  goto(url) {
    this.navCtrl.navigateRoot(url);
  }

  reAssignUser(user, kiosks) {
    this.dataService.getKiosksByPollingStationId(kiosks.pollingStation).subscribe(() => {
      this.dataService.setSelectedKiosks(kiosks);
    }, () => {
      // TODO handle incase if any errors
    });
    this.attendanceStatusService.setDataToRedirect(kiosks.pollingStation, user.kiosksAssigned, user);
    this.navCtrl.navigateRoot('/attendance/assignkioskstouser');
  }
}
