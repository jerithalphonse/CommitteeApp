import { PopoverController } from '@ionic/angular';
import { Component, OnInit } from '@angular/core';
import {LanguageService} from '../_services/language.service';
import {DataService} from '../_services/authentication.service';

@Component({
  selector: 'app-language-popover',
  templateUrl: './language.popover.page.html',
  styleUrls: [],
})
export class LanguagePopoverPage implements OnInit {
  languages = [];
  selected = '';

  constructor(private languageService: LanguageService, private popoverCtrl: PopoverController) { }

  ngOnInit() {
    this.languages = this.languageService.getLanguages();
    this.selected = this.languageService.selected;
  }

  select(lng) {
    this.languageService.setLanguage(lng);
    this.popoverCtrl.dismiss();
  }

}
