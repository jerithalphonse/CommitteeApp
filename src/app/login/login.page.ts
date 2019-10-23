import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {NavController, MenuController, LoadingController} from '@ionic/angular';
import {AuthenticationService} from '../_services/authentication.service';

@Component({
  selector: 'app-login',
  templateUrl: 'login.page.html',
  styleUrls: ['login.page.scss'],
})
export class LoginPage implements OnInit {
  public onLoginForm: FormGroup;
  public error: any;

  constructor(
    public navCtrl: NavController,
    public menuCtrl: MenuController,
    public loadingCtrl: LoadingController,
    private formBuilder: FormBuilder,
    private authenticationService: AuthenticationService,
  ) {
    this.authenticationService.currentUser.subscribe(value => {
      if (value && value.nameArabic && value.passwordChanged) {
        // this.goto('login');
        this.navCtrl.navigateRoot('/dashboard');
      }
    });
  }

  ionViewDidEnter() {
    // the root left menu should be disabled on this page
    this.menuCtrl.enable(false);
  }

  ionViewWillLeave() {
    // enable the root left menu when leaving this page
    this.menuCtrl.enable(true);
  }

  ngOnInit() {
    this.onLoginForm = this.formBuilder.group({
      username: [null, Validators.compose([
        Validators.required
      ])],
      password: [null, Validators.compose([
        Validators.required
      ])]
    });
  }

  get f() {
    return this.onLoginForm.controls;
  }
  async login(onLoginForm: any) {
    this.error = '';
    const processAttendance = (res, data) => {
      if (data && !data.attendedAt && data.roles && (data.roles.name === 'high_committee' || data.roles.name === 'main_committee' || data.roles.name === 'wali_officer' ||
        data.roles.name === 'wali_assistant' || data.roles.name === 'committee_head_voting' ||
        data.roles.name === 'committee_head_organizing' || data.roles.name === 'minister' || data.roles.name === 'high_committee' || data.roles.name === 'main_committee')) {
        data.attendedAt = new Date().toISOString();
        this.authenticationService.updateUser(res).subscribe(
          updateattendance => {
            if (data.passwordChanged === false) {
              this.navCtrl.navigateRoot('/password');
            } else {
              this.navCtrl.navigateRoot('/dashboard');
              dismissLoader(res);
            }
          },
          error => {
            if (error) {
              this.error = error;
            }
            dismissLoader(res);
          });
      } else {
        if (data.passwordChanged === false) {
          this.navCtrl.navigateRoot('/password');
        } else {
          this.navCtrl.navigateRoot('/dashboard');
        }
        dismissLoader(res);
      }
    };
    const dismissLoader = (res) => {
      res.dismiss();
      res.onDidDismiss().then((dis) => {
        console.log('Loading dismissed!');
      });
    };
    const authFunc = (res) => {
      this.authenticationService.login(this.f.username.value, this.f.password.value)
        .subscribe(
          data => {
            processAttendance(res, data);
          },
          error => {
            if (error) {
              this.error = error;
            }
            dismissLoader(res);
          });
    };
    const loader = await this.loadingCtrl.create({
      message: 'سجل دخولك'
    }).then((res) => {
      res.present();
      authFunc(res);
    });
  }
}
