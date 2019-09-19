import {Component, OnInit} from '@angular/core';
import {
  APIService,
  AuthenticationService,
  DataService,
  KiosksModel,
  WitnessStatusModel,
  WitnessStatusService
} from '../_services/authentication.service';
import {NavController, MenuController, LoadingController, ActionSheetController} from '@ionic/angular';
import {PollingStation, User} from '../_models';
import { AlertController, Platform } from '@ionic/angular';
import { PhotoViewer } from '@ionic-native/photo-viewer/ngx';

@Component({
  selector: 'app-witness-status-page',
  templateUrl: 'witness.status.page.html',
  styleUrls: ['witness.status.scss']
})
export class WitnessStatusPage implements OnInit {
  public user = new User({});
  public cameraopened = false;
  private isFlashLightOn = false;
  private blob = { image: undefined, blob: undefined};
  public initialized = false;
  public previewmode = false;
  public kiosksmodel = new KiosksModel();
  public witnessmodel = new WitnessStatusModel({});
  public selectedPollingstation: PollingStation;

  constructor(private authenticationService: AuthenticationService, public dataService: DataService,
              public alertController: AlertController,  public navCtrl: NavController, public witnessStatusService: WitnessStatusService,
              public photoViewer: PhotoViewer, public apiService: APIService, public actionSheetCtrl: ActionSheetController,
              public platform: Platform) {
    this.authenticationService.currentUser.subscribe(value => {
      this.user = value;
      if (this.user && this.user.roles.witnessTabAddMore && this.kiosksmodel) {
        this.dataService.getPollingStationForWilayatId(this.user.wilayat, {all: false});
        this.witnessStatusService.getWitnessStatusByWilayatId(this.user.wilayatCode, 'voting');
      }
    });
    this.dataService.currentDataService.subscribe(value => {
      this.kiosksmodel = value;
      if (this.kiosksmodel && this.kiosksmodel.wilayat && this.kiosksmodel.wilayat.code && !this.initialized) {
        this.initialized = true;
        this.dataService.getPollingStationForWilayatId(this.kiosksmodel.wilayat, {all: false});
        this.witnessStatusService.getWitnessStatusByWilayatId(this.kiosksmodel.wilayat.code, 'voting');
      }
      this.witnessmodel.updatePollingStationKeys(this.kiosksmodel.pollingstations);
    });
    this.witnessStatusService.currentDataService.subscribe(value => {
      this.witnessmodel = value;
    });
  }

  ngOnInit() {}
  openImageFullView(item) {
    this.photoViewer.show(item.imageUrl);
  }

  openCamera() {
    this.cameraopened = !this.cameraopened;
    this.authenticationService.openCameraPreview();
  }
  openImagePicker() {
    this.authenticationService.getImageFromPicker((blob, base64data) => {
      this.blob.image = 'data:image/png;base64,' + base64data;
      this.blob.blob = blob;
      this.previewmode = true;
      this.cameraopened = false;
    });
  }
  async addWitnessImages(pollingstation) {
    for (const i in this.kiosksmodel.pollingstations) {
      if (this.kiosksmodel && this.kiosksmodel.pollingstations[i] && this.kiosksmodel.pollingstations[i].name === pollingstation.name) {
        this.selectedPollingstation =  this.kiosksmodel.pollingstations[i];
      }
    }
    const actionSheet = this.actionSheetCtrl.create({
      cssClass: 'action-sheets-basic-page',
      buttons: [
        {
          text: 'تصوير',
          role: 'destructive',
          icon: !this.platform.is('ios') ? 'ios-camera-outline' : null,
          handler: () => {
            this.openCamera();
          }
        },
        {
          text: 'اختيار صورة من معرض',
          icon: !this.platform.is('ios') ? 'ios-images-outline' : null,
          handler: () => {
            this.openImagePicker();
          }
        },
      ]
    });

    actionSheet.then((action) => {
      action.present();
    }, () => {});
  }

  captureImage() {
    /** Default isFlashLightOn is false ,
     * enable it if false **/
    this.authenticationService.captureImage((blob, base64data) => {
      this.blob.image = 'data:image/png;base64,' + base64data;
      this.blob.blob = blob;
      this.previewmode = true;
      this.cameraopened = false;
    });
  }

  saveImage() {
    this.previewmode = false;
    let formData = new FormData();
    formData.append('files', this.blob.blob, 'witness_' + Math.random() + '.png');
    this.authenticationService.uploadImage(formData, (data) => {
      if (data && data.filesUploaded && data.filesUploaded.length) {
        this.witnessStatusService.updateWitnessId(data.filesUploaded[0], this.user, this.selectedPollingstation);
      } else {
        // TODO sorry couldnt upload the file
      }
    });
  }
  closeCamera() {
    this.blob = { blob: undefined, image: undefined};
    this.previewmode  = this.cameraopened = false;
    this.authenticationService.stopCamera();
  }
  toggleFlash() {
    this.isFlashLightOn = !this.isFlashLightOn;
    this.authenticationService.switchFlash(this.isFlashLightOn);
  }
  toggleCamera() {
    this.authenticationService.switchCamera();
  }
  goto(url) {
    this.authenticationService.stopCamera();
    this.navCtrl.navigateRoot(url);
  }
}
