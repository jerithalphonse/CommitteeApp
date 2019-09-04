import {Component, OnInit} from '@angular/core';
import {AuthenticationService} from '../_services/authentication.service';
import {User} from '../_models';
import {NavController} from '@ionic/angular';
import {Platform} from '@ionic/angular';
import {ChatService} from '../shared/chat/chat-service';

@Component({
  selector: 'app-dashboard',
  templateUrl: 'dashboard.page.html',
  styleUrls: ['dashboard.page.scss']
})
export class DashboardScreenPage implements OnInit {
  public user = new User({});
  constructor(private authenticationService: AuthenticationService, public navCtrl: NavController, public platform: Platform, public chatservice: ChatService) {
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
  navigateToMessaging(role) {
    if (role && role.name === 'head_committee') {
      this.goto('messaging');
    } else if (role && (role.name === 'wali_assistant' || role.name === 'wali_officer')) {
      this.goto('messaging');
    } else if (role.name !== 'head_committee' && role.name !== 'wali_officer' && role.name !== 'wali_assistant') {
      this.goto('messaging/chat/allmembers');
    }
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
