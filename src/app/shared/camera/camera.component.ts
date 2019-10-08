import {Component} from '@angular/core';

import {ActionSheetController, Platform} from '@ionic/angular';
import {AuthenticationService} from '../../_services/authentication.service';
import {User} from '../../_models';
import {ActivatedRoute} from '@angular/router';

@Component({
  selector: 'app-camera',
  templateUrl: './camera.component.html'
})
export class CameraComponent {
  public user = new User({});

  public cameraopened = false;
  private isFlashLightOn = false;
  private blob = { image: undefined, blob: undefined};
  public initialized = false;
  public previewmode = false;

  constructor(
    private route: ActivatedRoute,
    private platform: Platform, public actionSheetCtrl: ActionSheetController, public authenticationService: AuthenticationService) {
    this.initializeApp();
  }

  initializeApp() {
    this.platform.ready().then(() => {
      this.authenticationService.currentUser.subscribe(value => {
        this.user = value;
        console.log(this.user);
        this.route.snapshot.paramMap.get('name');
      });
    });
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
  saveImage() {
    this.previewmode = false;
    let formData = new FormData();
    formData.append('files', this.blob.blob, 'witness_' + Math.random() + '.png');
    this.authenticationService.uploadImage(formData, (data) => {
      this.closeCamera();
      if (data && data.filesUploaded && data.filesUploaded.length) {
        this.user.imageUrl = data.filesUploaded[0];
      } else {
        // TODO sorry couldnt upload the file
      }
    });
  }
  closeCamera() {
    this.blob = { blob: undefined, image: undefined};
    this.previewmode  = this.cameraopened = false;
    this.authenticationService.stopCamera();
    this.authenticationService.switchFlash(false);
  }
  toggleFlash() {
    this.isFlashLightOn = !this.isFlashLightOn;
    this.authenticationService.switchFlash(this.isFlashLightOn);
  }
  toggleCamera() {
    this.authenticationService.switchCamera();
  }
}
