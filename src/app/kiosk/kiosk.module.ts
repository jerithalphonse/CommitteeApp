import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';

import { KioskPage } from './kiosk.page';
import { KioskStatusPage } from './kiosk.status.page';
import {PollingStationListPage} from './pollingstationlist.page';
import {SharedModule} from '../shared/shared.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    SharedModule,
    RouterModule.forChild([
      {
        path: '',
        component: KioskPage
      },
      {
        path: 'kioskstatus',
        component: KioskStatusPage,
        children : [
          { path: 'assigned', component: PollingStationListPage },
          { path: 'unassigned', component: PollingStationListPage },
          { path: 'any', component: PollingStationListPage }
        ]
      },
      {
        path: 'assignusertokiosk',
        loadChildren: './assignusertokiosk/assignusertokiosk.module#AssignUserToKiosksModule'
      }
    ])
  ],
  declarations: [KioskPage, KioskStatusPage, PollingStationListPage]
})
export class KioskModule {}
