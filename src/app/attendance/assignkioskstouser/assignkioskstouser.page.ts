import {Component, OnInit} from '@angular/core';
import {
  AssignKiosksService,
  AttendanceStatusModel,
  AttendanceStatusService,
  AuthenticationService,
  DataService,
  KiosksModel
} from '../../_services/authentication.service';
import {NavController, MenuController, LoadingController} from '@ionic/angular';
import {User} from '../../_models';
import {AlertController} from '@ionic/angular';
import {error} from 'selenium-webdriver';

@Component({
  selector: 'app-attendance-assign-to-kiosk',
  templateUrl: 'assignkioskstouser.page.html',
  styleUrls: ['assignkioskstouser.scss']
})
export class AssignkioskstouserPage implements OnInit {
  public user = new User({});
  public kiosksmodel = new KiosksModel();
  public attendanceStatusModel = new AttendanceStatusModel({});


  constructor(private authenticationService: AuthenticationService, public dataService: DataService,
              public alertController: AlertController, public navCtrl: NavController,
              public attendanceStatusService: AttendanceStatusService, public assignKiosksService: AssignKiosksService) {
    this.authenticationService.currentUser.subscribe(value => {
      this.user = value;
    });
    this.dataService.currentDataService.subscribe(value => {
      this.kiosksmodel = value;
    });
    this.attendanceStatusService.currentDataService.subscribe(value => {
      this.attendanceStatusModel = value;
    });
  }

  changeKiosks(event, kiosks) {
    this.dataService.setSelectedKiosks(kiosks);
  }

  submit() {
    this.assignKiosksService.updateKiosksToUser(this.attendanceStatusModel.selectedKiosksAssigned
      && this.attendanceStatusModel.selectedKiosksAssigned.id ? this.attendanceStatusModel.selectedKiosksAssigned.id : undefined,
      this.user.id, this.attendanceStatusModel.selectedUser.id, this.kiosksmodel.kiosk.id,
      this.attendanceStatusModel.selectedPollingStation.id).subscribe(success => {
      this.attendanceStatusService.getAttendanceStatusByWilayatId(this.kiosksmodel.wilayat.code, this.kiosksmodel.pollingstation,
        this.kiosksmodel.currentTab, this.kiosksmodel.assigned).subscribe(() => {
        this.goto('attendance');
      }, (errors) => {
        // TODO Handle errors for not finding any kiosks
      });
    }, errors => {
      // TODO Handle errors for not finding any kiosks
    });
  }

  ngOnInit() {
  }

  goto(url: string) {
    this.navCtrl.navigateRoot(url);
  }
}
