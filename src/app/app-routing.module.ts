import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import {AuthGuard} from './_helpers';

const routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },
  {
    path: 'intro',
    loadChildren: './intro/intro.module#IntroPageModule'
  },
  {
    path: 'login',
    loadChildren: './login/login.module#LoginPageModule'
  },
  {
    path: 'dashboard',
    loadChildren: './dashboard/dashboard.module#DashboardModule', canActivate: [AuthGuard]
  },
  {
    path: 'kiosk',
    loadChildren: './kiosk/kiosk.module#KioskModule', canActivate: [AuthGuard]
  },
  {
    path: 'attendance',
    loadChildren: './attendance/attendance.module#AttendanceModule', canActivate: [AuthGuard]
  },
  {
    path: 'witness',
    loadChildren: './witness/witness.module#WitnessModule', canActivate: [AuthGuard]
  },
  {
    path: 'assignpollingstation',
    loadChildren: './assignpollingstation/assignpollingstation.module#AssignpollingstationModule', canActivate: [AuthGuard]
  },
  {
    path: 'scanqr',
    loadChildren: './scanqr/scanqr.module#ScanqrModule', canActivate: [AuthGuard]
  },
  {
    path: 'creds',
    loadChildren: './creds/creds.module#CredsModule', canActivate: [AuthGuard]
  },
  {
    path: 'votes',
    loadChildren: './votes/votes.module#VotesModule', canActivate: [AuthGuard]
  },
  {
    path: 'contacts',
    loadChildren: './contacts/contacts.module#ContactsModule', canActivate: [AuthGuard]
  },
  {
    path: 'messaging',
    loadChildren: './messaging/messaging.module#MessagingModule', canActivate: [AuthGuard]
  },
  {
    path: 'password',
    loadChildren: './password/password.module#PasswordModule', canActivate: [AuthGuard]
  }
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {}
