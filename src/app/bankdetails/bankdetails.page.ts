import {Component, OnInit} from '@angular/core';
import {NavController, ModalController, ActionSheetController, Platform} from '@ionic/angular';
import {
  AuthenticationService, DataService, KiosksModel,
  APIService,
} from '../_services/authentication.service';
import {User} from '../_models';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {PhotoViewer} from '@ionic-native/photo-viewer/ngx';

@Component({
  selector: 'app-bankdetails',
  templateUrl: 'bankdetails.page.html',
  styleUrls: ['bankdetails.page.scss']
})
export class BankdetailsPage implements OnInit {
  public user = new User({});
  public users = [];
  public cameraopened = false;
  private isFlashLightOn = false;
  private blob = { image: undefined, blob: undefined};
  public initialized = false;
  public previewmode = false;
  public kiosksmodel = new KiosksModel();
  public error = '';
  public validationerror = '';
  public onBankDetailsForm: FormGroup;


  constructor(public navCtrl: NavController,
              private formBuilder: FormBuilder,
              public photoViewer: PhotoViewer, public actionSheetCtrl: ActionSheetController, public platform: Platform,
              private authenticationService: AuthenticationService, public dataService: DataService) {
    this.authenticationService.currentUser.subscribe(value => {
      this.user = value;
    });
    this.dataService.currentDataService.subscribe(value => {
      this.kiosksmodel = value;
    });
  }

  get f() {
    return this.onBankDetailsForm.controls;
  }

  ngOnInit() {
    this.onBankDetailsForm = this.formBuilder.group({
      bankName: [null, Validators.compose([
        Validators.required
      ])],
      branchName: [null, Validators.compose([
        Validators.required
      ])],
      accountNo: [null, Validators.compose([
        Validators.required
      ])],
      accountNoConfirm: [null, Validators.compose([
        Validators.required
      ])],
      civilIdUrl: [null],
      agreement: [null, Validators.compose([
        Validators.required
      ])]
    });
    this.dataService.getBankingDetails(this.user.id).subscribe((bankingDetails: any) => {
      console.log('completed');
    }, () => {
      console.log('errors');
    });
  }

  async changeBankDetails(onBankDetailsForm: any) {
    this.kiosksmodel.bankDetails.userId = this.user.id;
    this.kiosksmodel.bankDetails.civilId = this.user.id;
    this.validationerror = this.kiosksmodel.bankDetails.validateData();
    this.error = '';
    if (this.validationerror) {
      return;
    }
    if (this.kiosksmodel.bankDetails.accountNo === this.kiosksmodel.bankDetails.accountNoConfirm && this.kiosksmodel.bankDetails.agreement) {
      this.dataService.changeBankDetails(this.kiosksmodel.bankDetails.getbankDetails())
        .subscribe(
          (data: any) => {
            this.error = 'تم تحديث  البيانات البنكية';
            // setTimeout(() => {
            //   this.navCtrl.navigateRoot('/dashboard');
            // }, 2000);
          },
          error => {
            alert(JSON.stringify(error));
            this.error = 'خطا في تحديث البيانات البنكية';
          });
    } else if (this.kiosksmodel.bankDetails.agreement === false) {
      this.error = 'يرجى وضع علامة صح في الصندوق اعلاه';
    } else {
      this.error = 'خطا في رقم الحساب';
    }
  }

  openImageFullView(url) {
    if (url) {
      this.photoViewer.show(url);
    }
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
  async addBankingImage() {
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
    formData.append('files', this.blob.blob, 'banking_' + Math.random() + '.png');
    this.authenticationService.uploadImage(formData, (data) => {
      if (data && data.filesUploaded && data.filesUploaded.length) {
        this.kiosksmodel.bankDetails.onChange(data.filesUploaded[0], 'civilIdUrl');
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

  goto(pagename: string) {
    this.navCtrl.navigateRoot(pagename);
  }
}
