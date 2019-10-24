import {Component, OnInit} from '@angular/core';
import {NavController, ModalController, MenuController, LoadingController} from '@ionic/angular';
import {Subscriber} from 'rxjs/Subscriber';
import {QRScanner, QRScannerStatus} from '@ionic-native/qr-scanner/ngx';
import {
  WitnessStatusService, AuthenticationService, DataService, KiosksModel,
  AssignKiosksModel, APIService, AssignKiosksService, KiosksStatusModel
} from '../_services/authentication.service';
import {KiosksAssign, User} from '../_models';

@Component({
  selector: 'page-scan-qr',
  templateUrl: 'scanqr.page.html',
  styleUrls: ['scanqr.page.scss']
})
export class ScanQrPage {
  private isBackMode = true;
  private isFlashLightOn = false;
  private scanSub: any;
  public scandata: any;
  public message = '';
  public user = new User({});
  public kiosksmodel = new KiosksModel();
  public assignkiosksmodel = new AssignKiosksModel({});
  public view = 'scan';
  public views = {
    scan: 'scan',
    assign: 'assign'
  };

  constructor(public navCtrl: NavController,
              public modalController: ModalController,
              public qrScanner: QRScanner,
              private authenticationService: AuthenticationService, public dataService: DataService,
              public apiService: APIService, public assignkiosksservice: AssignKiosksService) {
    this.authenticationService.currentUser.subscribe(value => {
      this.user = value;
    });
    this.dataService.currentDataService.subscribe(value => {
      this.kiosksmodel = value;
    });
    this.assignkiosksservice.currentDataService.subscribe(value => {
      this.assignkiosksmodel = value;
    });
  }


  ionViewWillEnter() {
    this.showCamera();
    // Optionally request the permission early
    this.qrScanner.prepare()
      .then((status: QRScannerStatus) => {
        if (status.authorized) {
          // camera permission was granted
          console.log('Camera Permission Given');

          this.scanSubScribe();

          // show camera preview
          this.qrScanner.show();

          // wait for user to scan something, then the observable callback will be called

        } else if (status.denied) {
          // camera permission was permanently denied
          // you must use QRScanner.openSettings() method to guide the user to the settings page
          // then they can grant the permission from there
          console.log('Camera permission denied');
        } else {
          // permission was denied, but not permanently. You can ask for permission again at a later time.
          console.log('Permission denied for this runtime.');
        }
      })
      .catch((e: any) => console.log('Error is', e));
  }

  scanSubScribe() {
    // start scanning
    this.scanSub = this.qrScanner.scan().subscribe((text: string) => {
      this.scandata = text;
      this.changeView('assign');
      this.qrScanner.hide(); // hide camera previeasw
      this.scanSub.unsubscribe(); // stop scanning
    });
  }

  getDataForScannedKiosks() {
    const validateTheUserScannedData = (data) => {
      data.canCurrentUserSelfAssignForKiosks(this.user);
      this.markAttendance();
    };
    this.assignkiosksservice.getKiosksById(this.scandata).subscribe(success => {
      this.assignkiosksservice.getUsersAssignedToPollingStation(success).subscribe(data => {
        validateTheUserScannedData(data);
      }, errors => {
        // alert('error' + JSON.stringify(errors));
        // TODO Handle errors for no kiosks assigned issues
      });
      this.hideCamera();
    }, errors => {
      // TODO Handle errors for not finding any kiosks
    });
  }

  changeView(view: string) {
    if (view === 'assign') {
      this.getDataForScannedKiosks();
    } else if (view === 'scan') {
      this.qrScanner.show(); // hide camera preview
      this.scanSubScribe();
      this.showCamera();
    }
    this.view = this.views[view];
  }

  goto(url: string) {
    this.navCtrl.navigateRoot(url);
  }

  closeModal() {
    this.modalController.dismiss();
  }


  toggleFlashLight() {
    /** Default isFlashLightOn is false ,
     * enable it if false **/
    this.isFlashLightOn = !this.isFlashLightOn;
    if (this.isFlashLightOn) {
      this.qrScanner.enableLight();
    } else {
      this.qrScanner.disableLight();
    }

  }

  toggleCamera() {
    /** Toggle Camera , Default is isBackMode is true , toggle
     * to false to enable front camera and vice versa.
     *
     * @type {boolean}
     */
    this.isBackMode = !this.isBackMode;
    if (this.isBackMode) {
      this.qrScanner.useFrontCamera();
    } else {
      this.qrScanner.useBackCamera();
    }
  }


  ionViewWillLeave() {
    this.qrScanner.hide(); // hide camera preview
    this.scanSub.unsubscribe(); // stop scanning
    this.hideCamera();
  }

  showCamera() {
    (window.document.querySelector('page-scan-qr') as HTMLElement).classList.add('cameraView');
  }

  hideCamera() {
    (window.document.querySelector('page-scan-qr') as HTMLElement).classList.remove('cameraView');
  }

  selfAssignKiosks() {
    // TODO assign the kiosks to the user
    this.assignkiosksservice.assignKiosksToUser(this.user.id, this.user.id, this.assignkiosksmodel.kiosks.id,
      this.assignkiosksmodel.kiosks.pollingStationID).subscribe(success => {
      this.message = 'Thank you ' + this.user.nameArabic + ' The kiosk has assigned to you';
      this.user.kiosks = this.assignkiosksmodel.kiosks;
      this.getDataForScannedKiosks();
    }, errors => {
      // TODO Handle errors for not finding any kiosks
    });
  }

  markAttendance() {
    // TODO Mark attendance for the user
    if (!this.user.attendedAt) {
      this.user.attendedAt = new Date().toISOString();
      this.authenticationService.updateUser(this.user).subscribe(() => {
        this.assignkiosksmodel.canCurrentUserSelfAssignForKiosks(this.user);
      });
    }
  }
}
