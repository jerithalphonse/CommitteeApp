import {Component, OnInit} from '@angular/core';
import {AuthenticationService} from '../_services/authentication.service';
import {User} from '../_models';
import {NavController} from '@ionic/angular';
import {Platform} from '@ionic/angular';

@Component({
  selector: 'app-dashboard',
  templateUrl: 'dashboard.page.html',
  styleUrls: ['dashboard.page.scss']
})
export class DashboardScreenPage implements OnInit {
  public user = new User({});

  constructor(private authenticationService: AuthenticationService, public navCtrl: NavController, public platform: Platform) {
    this.authenticationService.currentUser.subscribe(value => {
      if (!value) {
        this.goto('login');
      } else {
        this.user = value;
      }
    });
  }

  ngOnInit() {
  }

  goto(pagename: string) {
    this.navCtrl.navigateRoot(pagename);
  }

  openNavigation(pollingstation) {
    const destination = pollingstation.latitude + ',' + pollingstation.longitude;
    if (this.platform.is('ios')) {
      window.open('maps://?q=' + destination, '_system');
    } else {
      const label = encodeURI('Directions to polling station');
      window.open('geo:0,0?q=' + destination + '(' + label + ')', '_system');
    }
  }
}
