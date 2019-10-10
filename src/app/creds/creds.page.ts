import {Component, OnInit} from '@angular/core';
import {NavController, ModalController} from '@ionic/angular';
import {
  AuthenticationService, DataService, KiosksModel,
  APIService,
} from '../_services/authentication.service';
import {User} from '../_models';

@Component({
  selector: 'app-contacts',
  templateUrl: 'creds.page.html',
  styleUrls: ['creds.page.scss']
})
export class CredsPage implements OnInit {
  public user = new User({});
  public users = [];
  public kiosksmodel = new KiosksModel();
  public errors = '';


  constructor(public navCtrl: NavController,
              private authenticationService: AuthenticationService, public dataService: DataService) {
    this.authenticationService.currentUser.subscribe(value => {
      this.user = value;
    });
    this.dataService.currentDataService.subscribe(value => {
      this.kiosksmodel = value;
    });
  }

  ngOnInit() {
    const handler = (user) => {
      if (user && user.length) {
        this.errors = '';
        this.user = new User({
          username: user[0].username,
          nameEnglish: user[0].password,
          roleId: user[0].roleId,
          wilayatCode: user[0].wilayatCode
        });
      } else {
        this.errors = 'Please contact administator';
      }
    }
    if (this.user && this.user.roles && this.user.roles.name === 'main_committee' || this.user.roles.name === 'high_committee') {
      this.dataService.getCountingAppUserDetailsByRoleId(this.user.roles.id).subscribe((user: any) => {
        handler(user);
      }, () => {
        console.log('errors');
      });
    } else {
      this.dataService.getCountingAppUserDetailsByWilayatIdRoleId(this.user.wilayatCode, this.user.roles.id).subscribe((user: any) => {
        handler(user);
      }, () => {
        console.log('errors');
      });
    }

  }
}
