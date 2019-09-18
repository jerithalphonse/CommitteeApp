import {Component, OnInit} from '@angular/core';
import {AuthenticationService, DataService, KiosksModel} from '../_services/authentication.service';
import {NavController, MenuController, LoadingController} from '@ionic/angular';
import {User} from '../_models';
import { AlertController } from '@ionic/angular';

@Component({
  selector: 'app-shared-selectgovernorate',
  templateUrl: 'selectgovernorate.html',
  styleUrls: []
})
export class SelectGovernorateComponent implements OnInit {
  public user = new User({});
  public kiosksmodel = new KiosksModel();
  public readonly_view = {
    governorate: false,
    wilayat: false,
    pollingstation: false
  };
  customGovernorateOptions: any = {
    header: 'أختيار المحافظة',
    translucent: true
  };

  customWilayatOptions: any = {
    header: 'أختيار الولاية',
    translucent: true
  };

  customPSOptions: any = {
    header: 'أختيار المركز الانتخابي',
    translucent: true
  };

  constructor(private authenticationService: AuthenticationService, public dataService: DataService,
              public alertController: AlertController,  public navCtrl: NavController) {
    this.authenticationService.currentUser.subscribe(value => {
      this.user = value;
      if (this.user && this.user.roles && (this.user.roles.name === 'wali_officer' || this.user.roles.name === 'wali_assistant' ||
        this.user.roles.name === 'committee_head_voting' || this.user.roles.name === 'committee_head_counting')) {
        this.dataService.getGovernates();
        this.dataService.setGovernate(this.user.governorate);
        this.dataService.getWilayatFromGovernorateId(this.user.governorate);
        this.dataService.setWilayat(this.user.wilayat);
        this.dataService.getPollingStationForWilayatId(this.user.wilayat, {});
        this.readonly_view.governorate = true;
        this.readonly_view.wilayat = true;
      } else if (this.user && this.user.roles && this.user.roles.name === 'head_committee') {
        this.dataService.getGovernates();
      }
    });
    this.dataService.currentDataService.subscribe(value => {
      this.kiosksmodel = value;
    });
  }

  ngOnInit() {}

  goto(url: string) {
    this.navCtrl.navigateRoot(url);
  }
}
