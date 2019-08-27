import {Component, OnInit} from '@angular/core';
import {
  AttendanceStatusModel,
  AuthenticationService,
  DataService,
  KiosksModel,
  KiosksStatusModel,
  KiosksStatusService
} from '../../_services/authentication.service';
import {NavController} from '@ionic/angular';
import {User} from '../../_models';
import {AlertController} from '@ionic/angular';

@Component({
  selector: 'app-kiosks-assign-to-user',
  templateUrl: './assignusertokiosk.page.html',
  styleUrls: ['./assignusertokiosk.scss']
})
export class AssignUserToKioskPage implements OnInit {
  public user = new User({});
  public kiosksmodel = new KiosksModel();
  public attendanceStatusModel = new AttendanceStatusModel({});


  constructor(private authenticationService: AuthenticationService, public dataService: DataService,
              public alertController: AlertController, public navCtrl: NavController,
              public kiosksStatusModel: KiosksStatusModel,
              public kioskStatusService: KiosksStatusService) {
    this.authenticationService.currentUser.subscribe(value => {
      this.user = value;
    });
    this.dataService.currentDataService.subscribe(value => {
      this.kiosksmodel = value;
    });
    this.kioskStatusService.currentDataService.subscribe(value => {
      this.kiosksStatusModel = value;
    });
  }

  changeKiosks(event, kiosks) {
    this.dataService.setSelectedKiosks(kiosks);
  }

  submit() {
    this.kioskStatusService.updateKiosksToUser(this.attendanceStatusModel.selectedKiosksAssigned.id, this.user.id,
      this.attendanceStatusModel.selectedUser.id, this.kiosksmodel.kiosk.id,
      this.attendanceStatusModel.selectedPollingStation.id).subscribe(success => {
      this.kioskStatusService.getKiosksStatusByWilayatId(this.kiosksmodel.wilayat.code, this.kiosksmodel.pollingstation,
        this.kiosksmodel.currentTab, this.kiosksmodel.assigned).subscribe(() => {
        this.goto('attendance/attendancestatus/assigned');
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
