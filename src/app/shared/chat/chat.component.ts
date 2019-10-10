import {Component, OnInit, ViewChild, ElementRef, Pipe, PipeTransform} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import {AlertController, Events, IonContent, NavController} from '@ionic/angular';
import {ChatService, ChatMessage, ChatList} from './chat-service';
import {AuthenticationService, DataService, KiosksModel, WitnessStatusService} from '../../_services/authentication.service';
import {Governorate, User} from '../../_models';
import * as moment from 'moment';


@Pipe({
  name: 'dateconvert'
})
export class DateConvert implements PipeTransform {
  transform(value): any {
    return moment(value).locale('ar').fromNow();
  }
}

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss']
})
export class ChatComponent implements OnInit {
  @ViewChild(IonContent, {static: false}) content: IonContent;
  @ViewChild('chat_input', {static: false}) messageInput: ElementRef;
  public chat: ChatList = new ChatList({});
  public kiosksmodel = new KiosksModel();
  public user = new User({});
  public editorMsg = '';
  public isUserAssigned = false;
  public customWilayatOptions: any = {
    header: 'أختيار الولاية',
    translucent: true
  };

  constructor(private chatService: ChatService, private authenticationService: AuthenticationService, public dataService: DataService,
              public alertController: AlertController, private route: ActivatedRoute,
              public navCtrl: NavController, private witnessStatusService: WitnessStatusService) {
    this.dataService.getWilayatFromGovernorateId(new Governorate({})).subscribe(() => {}, () => {});
    this.authenticationService.currentUser.subscribe(value => {
      this.user = value;
      if (this.user && this.user.wilayat) {
        this.getMessagesByWilyatId(this.user.wilayat.code);
      }
    });
    this.chatService.currentDataService.subscribe(value => {
      this.chat = value;
    });
    this.dataService.currentDataService.subscribe(value => {
      this.kiosksmodel = value;
    });
  }

  ngOnInit() {
    const routername = this.route.snapshot.paramMap.get('name');
    this.chatService.setChatRole(routername).subscribe((success) => {
      console.log('chat role set', success);
    });
  }

  onFocus() {
    this.scrollToBottom();
  }

  getMessagesByWilyatId(code: string) {
    // Get mock message list
    return this.chatService
      .getMessagesByWilyatId(code, this.user)
      .subscribe(res => {
        this.scrollToBottom();
      });
  }

  changeWilayat(event) {
    this.dataService.changeWilayat(event).subscribe(() => {
      this.isUserAssigned = true;
      this.dataService.getUsersOfWilayatWithRoleId(this.kiosksmodel.wilayat, 'wali_officer').subscribe(() => {}, () => {});
    });
  }
  /**
   * @name sendMsg
   */
  sendMsg() {
    if (!this.editorMsg.trim()) {
      return;
    }
    let type = null;
    if (this.chat.chatrole === 'towaliofficers') {
      type = 'wilayat_officer_only';
    } else if (this.chat.chatrole === 'toheadcommittee') {
      type = 'high_committee_only';
    } else if (this.chat.chatrole === 'tocommitteehead') {
      type = 'committee_head_only';
    }

    this.chatService.sendMsg(this.editorMsg, this.user, type, this.isUserAssigned ? this.kiosksmodel.user : new User({})).subscribe(() => {
      this.editorMsg = '';
      this.getMessagesByWilyatId(this.user.wilayatCode);
      this.scrollToBottom();
    });
  }

  scrollToBottom() {
    setTimeout(() => {
      if (this.content.scrollToBottom) {
        this.content.scrollToBottom();
      }
    }, 400);
  }

  private focus() {
    if (this.messageInput && this.messageInput.nativeElement) {
      this.messageInput.nativeElement.focus();
    }
  }

  private setTextareaScroll() {
    const textarea = this.messageInput.nativeElement;
    textarea.scrollTop = textarea.scrollHeight;
  }
}
