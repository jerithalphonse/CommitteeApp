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

  changeUser(event, user) {
    this.dataService.setSelectedUsers(user);
  }

  submit() {
    this.kioskStatusService.updateKiosksToUser(this.kiosksStatusModel.selectedUser && this.kiosksStatusModel.selectedUser.id ? this.kiosksStatusModel.selectedUser.id : undefined, this.user.id,
      this.kiosksmodel.user.id, this.kiosksStatusModel.selectedKiosksSelected.id,
      this.kiosksStatusModel.selectedPollingStation.id).subscribe(success => {
      this.kioskStatusService.getKiosksStatusByWilayatId(this.kiosksmodel.wilayat.code, this.kiosksmodel.pollingstation,
        this.kiosksmodel.currentTab, this.kiosksmodel.assigned).subscribe(() => {
        this.goto('kiosk');
      }, (errors) => {
        // TODO Handle errors for not finding any kiosks
      });
    }, errors => {
      // TODO Handle errors for not finding any kiosks
    });
  }

  ngOnInit() {
  }
  // goBack() {
  //   this.navCtrl.pop();
  // }
  goto(url: string) {
    this.navCtrl.navigateRoot(url);
  }
}
