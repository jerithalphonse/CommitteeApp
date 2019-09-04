import {Component, OnInit, ViewChild, ElementRef, Pipe, PipeTransform} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import {AlertController, Events, IonContent, NavController} from '@ionic/angular';
import {ChatService, ChatMessage, ChatList} from './chat-service';
import {AuthenticationService, WitnessStatusService} from '../../_services/authentication.service';
import {User} from '../../_models';
import * as moment from 'moment';


@Pipe({
  name: 'dateconvert'
})
export class DateConvert implements PipeTransform {
  transform(value): any {
    return moment(value).fromNow();
  }
}

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss']
})
export class ChatComponent implements OnInit {
  @ViewChild(IonContent) content: IonContent;
  @ViewChild('chat_input') messageInput: ElementRef;
  public chat: ChatList = new ChatList({});
  public user = new User({});
  public editorMsg = '';

  constructor(private chatService: ChatService, private authenticationService: AuthenticationService,
              public alertController: AlertController, private route: ActivatedRoute,
              public navCtrl: NavController, private witnessStatusService: WitnessStatusService) {
    this.authenticationService.currentUser.subscribe(value => {
      this.user = value;
      this.getMessagesByWilyatId(this.user.wilayat.code);
    });
    this.chatService.currentDataService.subscribe(value => {
      this.chat = value;
    });
  }

  ngOnInit() {
    this.chatService.setChatRole(this.route.snapshot.paramMap.get('name')).subscribe((success) => {
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

  /**
   * @name sendMsg
   */
  sendMsg() {
    if (!this.editorMsg.trim()) {
      return;
    }
    let type = null;
    if (this.chat.chatrole === 'committeehead') {
      type = 'committee_head_only';
    } else if (this.chat.chatrole === 'toheadcommittee') {
      type = 'wilayat_officer_only';
    }

    this.chatService.sendMsg(this.editorMsg, this.user, null).subscribe(() => {
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
