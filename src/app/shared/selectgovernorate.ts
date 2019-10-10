import {Component, Input, OnInit} from '@angular/core';
import {AuthenticationService, DataService, KiosksModel} from '../_services/authentication.service';
import {NavController, MenuController, LoadingController} from '@ionic/angular';
import {User} from '../_models';
import { AlertController } from '@ionic/angular';
import {LanguageService} from '../_services/language.service';

@Component({
  selector: 'app-shared-selectgovernorate',
  templateUrl: 'selectgovernorate.html',
  styleUrls: []
})
export class SelectGovernorateComponent implements OnInit {
  @Input() readonly: any;
  get childData(): any { return this.readonly; }
  public placeholders = {
    governorate: 'اختيار المحافظة',
    language: 'ar'
  };
  public user = new User({});
  public kiosksmodel = new KiosksModel();
  public readonly_view = {
    governorate: false,
    wilayat: false,
    pollingstation: false
  };
  customGovernorateOptions: any = {
    header: 'اختيار المحافظة',
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
              public alertController: AlertController,  public navCtrl: NavController, public languageService: LanguageService) {
  }

  ngOnInit() {
    this.authenticationService.currentUser.subscribe(value => {
      this.user = value;
      if (this.user && this.user.roles && (this.user.roles.name !== 'high_committee' && this.user.roles.name !== 'main_committee')) {
        this.dataService.getGovernates();
        this.dataService.setGovernate(this.user.governorate);
        this.dataService.getWilayatFromGovernorateId(this.user.governorate).subscribe(() => {
          this.dataService.setWilayat(this.user.wilayat);
          this.dataService.getPollingStationForWilayatId(this.user.wilayat, {});
          if (this.readonly && this.readonly.governorate !== undefined) {
            this.readonly_view.governorate = this.readonly.governorate;
          } else {
            this.readonly_view.governorate = true;
          }
          if (this.readonly && this.readonly.wilayat !== undefined) {
            this.readonly_view.wilayat = this.readonly.wilayat;
          } else {
            this.readonly_view.wilayat = true;
          }
        }, () => {});
      } else if (this.user && this.user.roles && (this.user.roles.name === 'high_committee' || this.user.roles.name === 'main_committee')) {
        this.dataService.getGovernates();
      }
    });
    this.dataService.currentDataService.subscribe(value => {
      this.kiosksmodel = value;
      if (this.kiosksmodel.languageselected && this.kiosksmodel.languageselected === 'en') {
        this.customGovernorateOptions.header = 'Select Governorate*';
        this.placeholders.governorate = 'Select Governorate*';
        this.placeholders.language = 'en';
      } else {
        this.customGovernorateOptions.header = 'اختيار المحافظة';
        this.placeholders.governorate = 'اختيار المحافظة';
        this.placeholders.language = 'ar';
      }
    });
  }

  goto(url: string) {
    this.navCtrl.navigateRoot(url);
  }
}
