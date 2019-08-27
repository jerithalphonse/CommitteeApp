import {Component, OnInit} from '@angular/core';
import {
  WitnessStatusService, AuthenticationService, DataService, KiosksModel,
  AssignPollingStationModel, APIService
} from '../_services/authentication.service';
import {NavController, MenuController, LoadingController} from '@ionic/angular';
import {User} from '../_models';
import {AlertController} from '@ionic/angular';


@Component({
  selector: 'app-assignpollingstation',
  templateUrl: 'assignpollingstation.page.html',
  styleUrls: ['assignpollingstation.page.scss']
})
export class AssignpollingstationPage implements OnInit {
  public user = new User({});
  public kiosksmodel = new KiosksModel();
  public view = 'pollingstation';
  public views = {
    pollingstation: 'pollingstation',
    supervisor: 'supervisor',
    teammembers: 'teammembers',
    preview: 'preview'
  };
  public assignpollingstation = new AssignPollingStationModel({});

  constructor(private authenticationService: AuthenticationService, public dataService: DataService,
              public alertController: AlertController, public navCtrl: NavController,
              private witnessStatusService: WitnessStatusService, public apiService: APIService) {
    this.authenticationService.currentUser.subscribe(value => {
      this.user = value;
      this.dataService.getPollingStationForWilayatId(this.user.wilayat, {all: false});
    });
    this.dataService.currentDataService.subscribe(value => {
      this.kiosksmodel = value;
    });
  }

  changeView(view: string) {
    this.view = this.views[view];
    if (view === 'supervisor') {
      this.apiService.getUsersForPollingStation(this.user, this.kiosksmodel.pollingstation).subscribe(users => {
        this.assignpollingstation = new AssignPollingStationModel(users);
      });
    }
  }

  submit() {
    this.apiService.assignPollingStationToUsers(this.kiosksmodel.pollingstation, this.assignpollingstation, this.user).subscribe(result => {
      this.navCtrl.navigateRoot('dashboard');
    }, errors => {
      this.navCtrl.navigateRoot('dashboard');
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
    if (this.kiosksmodel && this.kiosksmodel.wilayat && this.kiosksmodel.wilayat.code) {
      this.navCtrl.navigateRoot(url);
    }
  }
}
