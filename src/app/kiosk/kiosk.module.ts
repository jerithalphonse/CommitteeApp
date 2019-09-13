import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';

import { KioskPage } from './kiosk.page';
import { KioskStatusPage } from './kiosk.status.page';
import {PollingStationListPage} from './pollingstationlist.page';
import {SharedModule} from '../shared/shared.module';
import {AttendancelistPage} from '../attendance/attendancelist.page';
import {TranslateModule} from '@ngx-translate/core';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    SharedModule,
    TranslateModule,
    RouterModule.forChild([
      {
        path: '',
        component: KioskPage
      },
      {
        path: 'kioskstatus',
        component: KioskStatusPage,
        children : [
          { path: 'voting', component: PollingStationListPage },
          { path: 'counting', component: PollingStationListPage },
          { path: 'organizing', component: PollingStationListPage },
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
