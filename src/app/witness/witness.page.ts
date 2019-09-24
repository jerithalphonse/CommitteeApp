import {Component, OnInit} from '@angular/core';
import {WitnessStatusService, AuthenticationService, DataService, KiosksModel} from '../_services/authentication.service';
import {NavController, MenuController, LoadingController} from '@ionic/angular';
import {User} from '../_models';
import { AlertController } from '@ionic/angular';

@Component({
  selector: 'app-kiosk',
  templateUrl: 'witness.page.html',
  styleUrls: ['witness.page.scss']
})
export class WitnessPage implements OnInit {
  public user = new User({});
  public kiosksmodel = new KiosksModel();

  constructor(private authenticationService: AuthenticationService, public dataService: DataService,
              public alertController: AlertController,  public navCtrl: NavController,  private witnessStatusService: WitnessStatusService ) {
    this.authenticationService.currentUser.subscribe(value => {
      this.user = value;
      if (this.user && this.user.roles && this.user.roles.witnessTabAddMore) {
        this.navCtrl.navigateRoot('witness/witnessstatus');
      }
    });
    this.dataService.currentDataService.subscribe(value => {
      this.kiosksmodel = value;
    });
  }

  ngOnInit() {
    this.kiosksmodel.show.set('pollingstation', false);
  }
  getWitnessStatus(type: string) {
    // this.attendanceStatusService.getKiosksLockedStats(this.kiosksmodel.wilayat.code);
    // this.witnessStatusService.getAttendanceStatusByWilayatId(this.kiosksmodel.wilayat.code, type);
  }
  goto(url: string) {
    if (this.kiosksmodel && this.kiosksmodel.wilayat && this.kiosksmodel.wilayat.arabicName) {
      this.navCtrl.navigateRoot(url);
    }
  }
}
