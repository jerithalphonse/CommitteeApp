import {Component, OnInit} from '@angular/core';
import {
  AuthenticationService,
  DataService,
  KiosksModel,
  WitnessStatusModel,
  WitnessStatusService
} from '../_services/authentication.service';
import {NavController, MenuController, LoadingController} from '@ionic/angular';
import {User} from '../_models';
import { AlertController } from '@ionic/angular';
import { PhotoViewer } from '@ionic-native/photo-viewer/ngx';


@Component({
  selector: 'app-messaging-status',
  templateUrl: 'messaging.status.page.html',
  styleUrls: ['messaging.status.scss']
})
export class MessagingStatusPage implements OnInit {
  public user = new User({});
  public items = [{
    src: 'https://5.imimg.com/data5/SQ/KV/MY-35169573/voter-id-card-500x500.jpg',
    text: 'sample 1'
  }, {
    src: 'https://5.imimg.com/data5/SQ/KV/MY-35169573/voter-id-card-500x500.jpg',
    text: 'sample 2'
  }, {
    src: 'https://5.imimg.com/data5/SQ/KV/MY-35169573/voter-id-card-500x500.jpg',
    text: 'sample 3'
  }, {
    src: 'https://5.imimg.com/data5/SQ/KV/MY-35169573/voter-id-card-500x500.jpg',
    text: 'sample 4'
  }];
  public kiosksmodel = new KiosksModel();
  public witnessmodel = new WitnessStatusModel({});

  constructor(private authenticationService: AuthenticationService, public dataService: DataService,
              public alertController: AlertController,  public navCtrl: NavController, public witnessStatusService: WitnessStatusService,
              public photoViewer: PhotoViewer) {
    this.authenticationService.currentUser.subscribe(value => {
      this.user = value;
    });
    this.dataService.currentDataService.subscribe(value => {
      this.kiosksmodel = value;
    });
    this.witnessStatusService.currentDataService.subscribe(value => {
      this.witnessmodel = value;
    });
  }

  ngOnInit() {
    // this.photoViewer.show('https://5.imimg.com/data5/SQ/KV/MY-35169573/voter-id-card-500x500.jpg', 'My image title', {share: false});
    // this.photoViewer.show('https://5.imimg.com/data5/SQ/KV/MY-35169573/voter-id-card-500x500.jpg', 'My image title', {share: false, headers: '{username:foo,password:bar}'});
  }
  openImageFullView(item) {
    this.photoViewer.show(item.src);
  }
  goto() {}
}
