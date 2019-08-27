import {Component} from '@angular/core';
import {User} from '../_models';
import {AuthenticationService} from '../_services/authentication.service';
import {NavController, Platform} from '@ionic/angular';

@Component({
  selector: 'app-intro',
  templateUrl: 'intro.page.html',
  styleUrls: ['intro.page.scss'],
})
export class IntroPage {
  public slideOpts = {
    initialSlide: 0,
    speed: 400
  };
  public user = new User({});

  constructor(private authenticationService: AuthenticationService, public navCtrl: NavController, public platform: Platform) {
    this.authenticationService.currentUser.subscribe(value => {
      this.user = value;
      if (this.user) {
        this.goto('dashboard');
      }
    });
  }

  goto(pagename: string) {
    this.navCtrl.navigateRoot(pagename);
  }
}
