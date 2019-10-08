import {AfterViewInit, Component, OnInit} from '@angular/core';
import {AuthenticationService} from '../_services/authentication.service';
import {User} from '../_models';
import {NavController} from '@ionic/angular';
import {Platform} from '@ionic/angular';
import {ChatService} from '../shared/chat/chat-service';

declare var $: any;

@Component({
  selector: 'app-dashboard',
  templateUrl: 'dashboard.page.html',
  styleUrls: ['dashboard.page.scss']
})
export class DashboardScreenPage implements OnInit, AfterViewInit {
  public user = new User({});
  public started = false;

  constructor(private authenticationService: AuthenticationService, public navCtrl: NavController, public platform: Platform, public chatservice: ChatService) {
    this.authenticationService.currentUser.subscribe(value => {
      if (!(value && value.nameArabic)) {
        this.goto('login');
      } else {
        this.user = value;
      }
    });
  }

  ngOnInit() {
  }

  ngAfterViewInit(): void {
    this.initTimer();
  }

  goto(pagename: string) {
    this.navCtrl.navigateRoot(pagename);
  }

  navigateToMessaging(role) {
    if (role && role.name === 'high_committee') {
      this.goto('messaging');
    } else if (role && role.name === 'main_committee') {
      this.goto('messaging');
    } else if (role && (role.name === 'wali_assistant' || role.name === 'wali_officer')) {
      this.goto('messaging');
    } else if (role.name !== 'high_committee' && role.name !== 'main_committee' && role.name !== 'wali_officer' && role.name !== 'wali_assistant') {
      this.goto('messaging/chat/toallmembers');
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

  initTimer() {
    let clock;

    // Grab the current date
    let currentDate = new Date();

    // Set some date in the future. In this case, it's always Jan 1
    let futureDate = new Date(currentDate.getFullYear(), 9, 27, 6, 59);

    // Calculate the difference in seconds between the future and current date
    let diff = futureDate.getTime() / 1000 - currentDate.getTime() / 1000;
    this.started = ((((diff / 60) / 60) / 24) <= 0);
    const startClock = (futureDateAt, clockface, showseconds, callback) => {
      diff = futureDateAt.getTime() / 1000 - currentDate.getTime() / 1000;
      // Instantiate a coutdown FlipClock
      clock = $('.clock').FlipClock(diff, {
        clockFace: clockface,
        countdown: true,
        language: 'ar-ar',
        showSeconds: showseconds,
        callbacks: callback
      });
    };
    if (this.started) {
      futureDate = new Date(currentDate.getFullYear(), 9, 27, 19, 0);
      startClock(futureDate, 'HourlyCounter', true,
        {});
    } else {
      // futureDate = new Date(currentDate.getFullYear(), 9, 27, 6, 59);
      startClock(futureDate, 'DailyCounter', false,
        {
        interval: () => {
          currentDate = new Date();
          diff = futureDate.getTime() / 1000 - currentDate.getTime() / 1000;
          if (diff <= 0) {
            clock.stop(() => {
              this.started = true;
              futureDate = new Date(currentDate.getFullYear(), 9, 27, 19, 0);
              startClock(futureDate,  'HourlyCounter', true,
                {});
            });
          }
        }
      });
    }
  }
}
