import {Component, OnInit} from '@angular/core';
import {AuthenticationService, DataService, KiosksModel, KiosksStatusModel, KiosksStatusService} from '../_services/authentication.service';
import {NavController, MenuController, LoadingController} from '@ionic/angular';
import {KiosksAssign, User} from '../_models';
import { AlertController } from '@ionic/angular';
import { ActivatedRoute } from '@angular/router';
@Component({
  selector: 'app-pollingstation-list',
  templateUrl: 'pollingstationlist.page.html',
  styleUrls: ['kiosk.status.scss']
})
export class PollingStationListPage implements OnInit {
  public user = new User({});
  public kiosksmodel = new KiosksModel();
  public kioksstatus = new KiosksStatusModel();
  customPSOptions: any = {
    header: 'اختر محطة الاقتراع',
    translucent: true
  };
  constructor(private authenticationService: AuthenticationService, public dataService: DataService,
              public kiosksStatusService: KiosksStatusService,
              public alertController: AlertController,  public navCtrl: NavController, private activatedRoute: ActivatedRoute) {
    this.authenticationService.currentUser.subscribe(value => {
      this.user = value;
    });
    this.dataService.currentDataService.subscribe(value => {
      this.kiosksmodel = value;
    });
    this.kiosksStatusService.currentDataService.subscribe( value => {
      this.kioksstatus = value;
    });
  }
  onChangePollingStation(event) {
    this.dataService.onChangePollingStation(event);
    setTimeout(() => {
      this.kiosksStatusService.getKiosksStatusByWilayatId(this.kiosksmodel.wilayat.code,
        this.kiosksmodel.pollingstation, this.kiosksmodel.currentTab, this.kiosksmodel.assigned).subscribe(() => {}, (errors) => {
        // TODO Handle errors for not finding any kiosks
      });
    }, 100);
  }
  ngOnInit() {}
  reAssignUser(user, kiosks) {
    this.dataService.getUsersByPollingStationId(kiosks.pollingStation, this.user).subscribe(() => {
      this.dataService.setSelectedUsers(user);
    }, () => {
      // TODO handle incase if any errors
    });
    this.kiosksStatusService.setDataToRedirect(kiosks.pollingStation, kiosks, user);
    this.navCtrl.navigateRoot('/kiosk/assignusertokiosk');
  }
  assignUser(kiosks) {
    this.dataService.getUsersByPollingStationId(kiosks.pollingStation, this.user).subscribe(() => {
      this.dataService.setSelectedUsers(undefined);
    }, () => {
      // TODO handle incase if any errors
    });
    this.kiosksStatusService.setDataToRedirect(kiosks.pollingStation, kiosks, undefined);
    this.navCtrl.navigateRoot('/kiosk/assignusertokiosk');
  }
  goto(url) {
    this.navCtrl.navigateRoot(url);
  }
}
