import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';

import {AttendancePage} from './attendance.page';
import {SharedModule} from '../shared/shared.module';
import {AttendanceStatusPage} from './attendance.status.page';
import {AttendancelistPage} from './attendancelist.page';
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
        component: AttendancePage
      },
      {
        path: 'attendancestatus',
        component: AttendanceStatusPage,
        children : [
          { path: 'voting', component: AttendancelistPage },
          { path: 'counting', component: AttendancelistPage },
          { path: 'organizing', component: AttendancelistPage },
          { path: 'assigned', component: AttendancelistPage },
          { path: 'unassigned', component: AttendancelistPage },
          { path: 'any', component: AttendancelistPage }
        ]
      },
      {
        path: 'assignkioskstouser',
        loadChildren: './assignkioskstouser/assignkioskstouser.module#AssignkioskstouserModule'
      },
    ])
  ],
  declarations: [AttendancePage, AttendanceStatusPage, AttendancelistPage]
})
export class AttendanceModule {}
