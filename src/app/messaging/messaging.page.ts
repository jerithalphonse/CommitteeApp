import {Component, OnInit} from '@angular/core';
import {WitnessStatusService, AuthenticationService, DataService, KiosksModel} from '../_services/authentication.service';
import {NavController, MenuController, LoadingController} from '@ionic/angular';
import {User} from '../_models';
import { AlertController } from '@ionic/angular';

@Component({
  selector: 'app-messaging',
  templateUrl: 'messaging.page.html',
  styleUrls: ['messaging.page.scss']
})
export class MessagingPage implements OnInit {
  public user = new User({});

  constructor(private authenticationService: AuthenticationService,
              public alertController: AlertController,  public navCtrl: NavController,  private witnessStatusService: WitnessStatusService ) {
    this.authenticationService.currentUser.subscribe(value => {
      this.user = value;
    });
  }

  ngOnInit() {
  }
  goto(url: string) {
    this.navCtrl.navigateRoot(url);
  }
}
