import {Component, OnInit} from '@angular/core';
import {WitnessStatusService, AuthenticationService, DataService, KiosksModel} from '../_services/authentication.service';
import {NavController, MenuController, LoadingController} from '@ionic/angular';
import {User} from '../_models';
import { AlertController } from '@ionic/angular';
import {ChatList, ChatService} from '../shared/chat/chat-service';

@Component({
  selector: 'app-messaging',
  templateUrl: 'messaging.page.html',
  styleUrls: ['messaging.page.scss']
})
export class MessagingPage implements OnInit {
  public user = new User({});
  public chat: ChatList = new ChatList({});
  public restrictmessage: boolean;

  constructor(private authenticationService: AuthenticationService,
              public alertController: AlertController,  public navCtrl: NavController,  private witnessStatusService: WitnessStatusService,
              public chatService: ChatService) {
    this.authenticationService.currentUser.subscribe(value => {
      this.user = value;
    });
    this.chatService.currentDataService.subscribe(value => {
      this.chat = value;
      if (this.chat && this.chat.restrictwali) {
        let temp = this.chat.restrictwali;
        if (temp && temp.length) {
          if (temp[temp.length - 1].startDateTime && !temp[temp.length - 1].endDateTime) {
            this.restrictmessage = true;
          } else if (temp[temp.length - 1].endDateTime) {
            this.restrictmessage = false;
          }
        } else if (temp) {
          this.restrictmessage = false;
        }
      }
    });
  }
  restrictMessageWali(event) {
    this.chatService.restrictWali(event.detail.checked);
  }
  ngOnInit() {
  }
  goto(url: string) {
    this.navCtrl.navigateRoot(url);
  }
}
