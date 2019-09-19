import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {NavController, MenuController, LoadingController} from '@ionic/angular';
import {AuthenticationService} from '../_services/authentication.service';
import {User} from '../_models';

@Component({
  selector: 'app-changepassword',
  templateUrl: 'password.page.html',
  styleUrls: ['password.page.scss'],
})
export class PasswordPage implements OnInit {
  public onPasswordForm: FormGroup;
  public error: any;
  public user: User;

  constructor(
    public navCtrl: NavController,
    public menuCtrl: MenuController,
    public loadingCtrl: LoadingController,
    private formBuilder: FormBuilder,
    private authenticationService: AuthenticationService,
  ) {
    this.authenticationService.currentUser.subscribe(value => {
      if (!value) {
        this.goto('login');
      } else {
        this.user = value;
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
    this.onPasswordForm = this.formBuilder.group({
      oldpassword: [null, Validators.compose([
        Validators.required
      ])],
      newpassword: [null, Validators.compose([
        Validators.required
      ])],
      confirmpassword: [null, Validators.compose([
        Validators.required
      ])]
    });
  }

  get f() {
    return this.onPasswordForm.controls;
  }

  async changePassword(onPasswordForm: any) {
    this.error = '';
    const dismissLoader = (res) => {
      res.dismiss();
      res.onDidDismiss().then((dis) => {
        console.log('Loading dismissed!');
      });
    };
    const authFunc = (res) => {
      this.authenticationService.changePassword(this.user.id, this.f.oldpassword.value, this.f.newpassword.value)
        .subscribe(
          (data: any) => {
            if (data && data.success) {
              this.navCtrl.navigateRoot('/login');
            } else {
              this.error = 'فشل في تغيير كلمة المرور';
            }
            dismissLoader(res);
          },
          error => {
            if (error) {
              this.error = error;
            }
            dismissLoader(res);
          });
    };
    const loader = await this.loadingCtrl.create({
      message: 'تغيير كلمة المرور'
    }).then((res) => {
      res.present();
      if (this.f.newpassword.value === this.f.confirmpassword.value) {
        authFunc(res);
      } else {
        this.error = 'عدم تطابق كلمة المرور';
      }

    });
  }
  goto(pagename: string) {
    this.navCtrl.navigateRoot(pagename);
  }
}
