import {Component, OnInit} from '@angular/core';
import {AuthenticationService, DataService, KiosksModel} from '../../_services/authentication.service';
import {NavController} from '@ionic/angular';
import {User} from '../../_models';
import { AlertController } from '@ionic/angular';

@Component({
  selector: 'app-shared-userdirective',
  templateUrl: 'user.directive.html',
  styleUrls: []
})
export class UserNameDirectiveComponent implements OnInit {
  public user = new User({});
  public kiosksmodel = new KiosksModel();
  constructor(private authenticationService: AuthenticationService, public dataService: DataService,
              public alertController: AlertController,  public navCtrl: NavController) {
    this.authenticationService.currentUser.subscribe(value => {
      this.user = value;
    });
  }

  ngOnInit() {}
}
