import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {BehaviorSubject, Observable} from 'rxjs';
import {map} from 'rxjs/operators';
import {config, Governorate, PollingStation, User, Wilayat, KiosksAssign, Kiosks, BankDetails} from '../_models';
import {ImagePicker} from '@ionic-native/image-picker/ngx';
import {
  CameraPreview, CameraPreviewPictureOptions, CameraPreviewOptions,
  CameraPreviewDimensions
} from '@ionic-native/camera-preview/ngx';
import _ from 'lodash';

// import { Camera, CameraOptions } from '@ionic-native/camera/ngx';
export class KiosksStatusViewModel extends Kiosks {
  public kioskassigned: Array<KiosksAssign> = [];

  constructor(props) {
    super(props);
  }
}

export class Witness {
  public id: number;
  public imageUrl: string;
  public pollingStation: PollingStation;
  public pollingStationID: number;
  public uploadedBy: number;
  public uploadedByMember: User;
  public uploadedTime: string;
  public wilayat: Wilayat;
  public wilayatCode: string;

  constructor(props) {
    this.id = props.id ? props.id : '';
    this.imageUrl = props.imageUrl ? props.imageUrl : '';
    this.pollingStation = props.pollingStation ? props.pollingStation : '';
    this.pollingStationID = props.pollingStationID ? props.pollingStationID : '';
    this.uploadedBy = props.uploadedBy ? props.uploadedBy : '';
    this.uploadedByMember = props.uploadedByMember ? props.uploadedByMember : '';
    this.uploadedTime = props.uploadedTime ? props.uploadedTime : '';
    this.wilayat = props.wilayat ? props.wilayat : '';
    this.wilayatCode = props.wilayatCode ? props.wilayatCode : '';
  }
}

export class WitnessStatusModel {
  public pollingstations: Array<{ name: string, arabicName: string, witness: Array<Witness> }> = [];

  constructor(props) {

  }

  updatePollingStationKeys(pollingstations: Array<PollingStation>) {
    this.pollingstations = [];
    for (const i in pollingstations) {
      if (pollingstations[i]) {
        this.pollingstations.push({name: pollingstations[i].name, arabicName: pollingstations[i].arabicName, witness: []});
      }
    }
  }

  clearPollingStationsWitnessInfo() {
    for (const i in this.pollingstations) {
      if (this.pollingstations[i]) {
        this.pollingstations[i].witness = [];
      }
    }
  }

  updateWitnessData(success: any) {
    const pollingstations = {};
    this.clearPollingStationsWitnessInfo();
    for (const i in success) {
      if (success[i] && success[i].pollingStation) {
        if (pollingstations[success[i].pollingStation.name]) {
          pollingstations[success[i].pollingStation.name].push(new Witness(success[i]));
        } else {
          pollingstations[success[i].pollingStation.name] = [];
          pollingstations[success[i].pollingStation.name].push(new Witness(success[i]));
        }
      }
    }
    for (const i in this.pollingstations) {
      if (this.pollingstations[i] && pollingstations && pollingstations[this.pollingstations[i].name]) {
        this.pollingstations[i].witness = pollingstations[this.pollingstations[i].name];
      }
    }
  }
}

export class AssignKiosksModel {
  public users: Array<UserModel> = [];
  public kioskAssignedToCurrent: Array<UserModel> = [];
  public kiosks = new Kiosks({});
  public isSelfAssignable = false;
  public attendanceMarked = false;
  public canMarkAttendance = false;
  public userPartOfOtherPollingStation = false;
  public showAssigned = false;

  constructor(props) {
  }

  addKiosks(kiosks: any) {
    if (kiosks && kiosks.length && kiosks[0].id) {
      this.kiosks = new Kiosks(kiosks[0]);
    }
  }

  addUsersAssigned(users: any) {
    this.users = [];
    for (const i in users) {
      if (users && users[i]) {
        this.users.push(new UserModel(users[i]));
      }
    }
  }

  canCurrentUserMarkAttendanceForKiosks(user) {
    if (user && this.kiosks && user.pollingStationId === this.kiosks.pollingStationID && !user.attendedAt) {
      return true;
    }
    return false;
  }

  canCurrentUserSelfAssignForKiosks(user) {
    this.kioskAssignedToCurrent = [];
    this.isSelfAssignable = false;
    this.canMarkAttendance = false;
    this.userPartOfOtherPollingStation = false;
    this.attendanceMarked = false;
    this.showAssigned = false;
    // check if the user is already assigned to a kiosks
    const canMarkAttendance = this.canCurrentUserMarkAttendanceForKiosks(user);
    // if user canMarkAttendance check if he already did
    let currentAssigned;
    user.attendedAt ? this.attendanceMarked = true : this.attendanceMarked = false;
    if (canMarkAttendance) {
      this.canMarkAttendance = true;
    }
    for (const i in this.users) {
      if (this.users[i] && this.users[i].kiosks.id === this.kiosks.id) {
        this.kioskAssignedToCurrent.push(this.users[i]);
      }
      if (this.users[i] && this.users[i].kiosksAssigned.memberId === user.id) {
        currentAssigned = this.users[i];
        this.showAssigned = true;
      }
    }
    if (this.kiosks && this.kiosks.pollingStationID !== user.pollingStationId) {
      // check if user if not part of this polling station
      this.userPartOfOtherPollingStation = true;
    } else {
      // if user doesnt belong to any kiosk check if this kiosks is assigned to 2 people already and role of user
      // to be part of voting commite and check if supervisor have not assigned him any kiosks
      if (!(this.kioskAssignedToCurrent && this.kioskAssignedToCurrent.length >= 2) && (user.roleId === 4 || user.roleId === 6 ||
        user.roleId === 8) && !currentAssigned) {
        this.isSelfAssignable = true;
      }
    }
  }
}

export class UserModel extends User {
  public selected = false;
  public kiosksAssigned = new KiosksAssign({});
  // public val;
  // public isChecked = false;
  constructor(props) {
    super(props);
    this.selected = props.selected ? props.selected : false;
    this.kiosksAssigned = props.kiosksAssigned ? new KiosksAssign({
      ...props.kiosksAssigned,
      kiosks: props.kiosksAssignedKiosk
    }) : new KiosksAssign({});
    // this.isChecked = props.isChecked ? props.isChecked : false;
    // this.val = props.id ? props.id : '';
  }

  removeKeys(keys) {
    for (const i in keys) {
      if (keys[i]) {
        delete this[keys[i]];
      }
    }
  }
}

export class AssignPollingStationModel {
  public users: Array<UserModel> = [];
  public nonsupervisorusers: Array<UserModel> = [];
  public nonsupervisorusersorginal = {};
  public supervisor: UserModel;
  public supervisororiginal: UserModel;

  constructor(props) {
    this.assignedsupervisor(props);
    this.addUsers(props);
  }

  addUsers(data) {
    if (data && data.users && data.users.length) {
      for (const i in data.users) {
        if (data.users[i]) {
          this.users.push(new UserModel(data.users[i]));
        }
      }
      this.generateNonSuperVisorUsers();
    }
  }

  generateNonSuperVisorUsers() {
    this.nonsupervisorusers = [];
    for (const i in this.users) {
      if (this.users && this.users[i] && this.supervisor && this.users[i].username !== this.supervisor.username) {
        this.nonsupervisorusers.push(this.users[i]);
        this.nonsupervisorusersorginal[this.users[i].id] = new UserModel(this.users[i]);
      }
    }
  }

  assignedsupervisor(data) {
    if (data && data.supervisor) {
      data.supervisor.selected = false;
      this.supervisor = new UserModel(data.supervisor);
      this.supervisororiginal = new UserModel(data.supervisor);
    }
  }

  assignsupervisor(supervisor: UserModel) {
    this.supervisor = supervisor;
    supervisor.selected = true;
    // remove user from unassignedusers
    this.generateNonSuperVisorUsers();
  }

  getSelectedMembers() {
    const selectedusers: any = [];
    const unselectedusers: any = [];
    let previousSupervisor: any;
    for (const i in this.nonsupervisorusers) {
      if (this.nonsupervisorusers[i] && this.nonsupervisorusers[i].selected) {
        selectedusers.push(this.nonsupervisorusers[i]);
      } else if (this.nonsupervisorusers[i] && !this.nonsupervisorusers[i].selected && this.nonsupervisorusersorginal) {
        // check if the nonsupervisoruser is previously selected
        const temp = this.nonsupervisorusersorginal[this.nonsupervisorusers[i].id];
        if (temp && temp.selected && !this.nonsupervisorusers[i].selected) {
          unselectedusers.push(temp);
        }
      }
    }
    // check if previous selected supervisor changed
    if (this.supervisor && this.supervisororiginal && this.supervisor.id !== this.supervisororiginal.id ) {
      previousSupervisor = this.supervisororiginal;
    }
    return {unselectedusers, selectedusers, previousSupervisor};
  }

  assignMember(event, user: UserModel) {
    // user.selected = !user.selected;
  }
}

export class AttendanceStatusModel {
  public users: Array<User> = [];
  public pollingstationsAll: Array<{ name: string, arabicName: string, users: Array<UserModel> }> = [];
  public pollingstations: Array<{ name: string, arabicName: string, users: Array<UserModel> }> = [];
  public attendanceStatus: any = {total: 0, present: 0, absent: 0};

  public selectedUser: User;
  public selectedPollingStation: PollingStation;
  public selectedKiosksAssigned: any;

  constructor(props) {

  }

  updatePollingStationKeys(pollingstations: Array<PollingStation>) {
    this.pollingstations = [];
    this.pollingstationsAll = [];
    for (const i in pollingstations) {
      if (pollingstations[i]) {
        this.pollingstations.push({name: pollingstations[i].name, arabicName: pollingstations[i].arabicName, users: []});
        this.pollingstationsAll.push({name: pollingstations[i].name, arabicName: pollingstations[i].arabicName, users: []});
      }
    }
  }

  setDataToRedirect(pollingStation: PollingStation, kiosksAssigned: any, user: User) {
    this.selectedPollingStation = pollingStation;
    this.selectedKiosksAssigned = kiosksAssigned;
    this.selectedUser = user;
  }

  clearPollingStationsWitnessInfo() {
    for (const i in this.pollingstations) {
      if (this.pollingstations[i]) {
        this.pollingstations[i].users = [];
        this.pollingstationsAll[i].users = [];
      }
    }
  }

  setPollingStationKeys(pollingStationname) {
    this.pollingstations = [];
    for (const i in this.pollingstationsAll) {
      if (pollingStationname && pollingStationname === this.pollingstationsAll[i].name && pollingStationname !== 'All') {
        this.pollingstations.push({name: this.pollingstationsAll[i].name, arabicName: this.pollingstationsAll[i].arabicName, users: []});
      } else if (this.pollingstationsAll[i] && this.pollingstationsAll[i].name && pollingStationname === undefined) {
        this.pollingstations.push({name: this.pollingstationsAll[i].name, arabicName: this.pollingstationsAll[i].arabicName, users: []});
      }
    }
  }

  calculateAttendanceStatus(pollingstations) {
    this.attendanceStatus = {total: 0, present: 0, absent: 0};
    for (const i in pollingstations) {
      if (pollingstations[i] && pollingstations[i].users) {
        this.attendanceStatus.total += pollingstations[i].users.length;
        for (const j in pollingstations[i].users) {
          if (pollingstations[i].users[j].attendedAt) {
            this.attendanceStatus.present++;
          } else {
            this.attendanceStatus.absent++;
          }
        }
      }
    }
  }

  applyFiltersPollingStation(pollingStationName, committeetype, assignedstatus) {
    const filterData = (pollingStationinfo, type, assigned) => {
      const filterAssigned = (assignedas, pollingStation, i) => {
        if (assignedas === 'assigned' && pollingStation.users[i].kiosksAssigned && pollingStation.users[i].kiosksAssigned.id) {
          users.push(pollingStation.users[i]);
        } else if (assigned === 'unassigned' && pollingStation.users[i].kiosksAssigned && !pollingStation.users[i].kiosksAssigned.id) {
          users.push(pollingStation.users[i]);
        } else if (assigned === 'any') {
          users.push(pollingStation.users[i]);
        }
      };
      const users = [];
      for (const i in pollingStationinfo.users) {
        if (pollingStationinfo.users[i] && pollingStationinfo.users[i].roles) {
          const name = pollingStationinfo.users[i].roles.name;
          if ((name === 'committee_head_voting' || name === 'polling_station_supervisor_voting' ||
            name === 'committee_member_voting') && type === 'voting') {
            filterAssigned(assigned, pollingStationinfo, i);
          } else if ((name === 'committee_head_counting' || name === 'polling_station_supervisor_counting' ||
            name === 'committee_member_counting') && type === 'counting') {
            filterAssigned(assigned, pollingStationinfo, i);
          } else if ((name === 'committee_head_organizing' || name === 'polling_station_supervisor_organizing' ||
            name === 'committee_member_organizing') && type === 'organizing') {
            filterAssigned(assigned, pollingStationinfo, i);
          }
        }
      }
      return {name: pollingStationinfo.name, users};
    };
    if (pollingStationName === 'All') {
      this.setPollingStationKeys(undefined);
      for (const i in this.pollingstationsAll) {
        if (this.pollingstationsAll && this.pollingstationsAll[i].name) {
          const temp = filterData(this.pollingstationsAll[i], committeetype, assignedstatus);
          for (const j in this.pollingstations) {
            if (this.pollingstations[i] && this.pollingstations[i].name === temp.name) {
              this.pollingstations[i].users = temp.users;
              break;
            }
          }
        }
      }
    } else {
      this.setPollingStationKeys(pollingStationName);
      for (const i in this.pollingstationsAll) {
        if (this.pollingstationsAll && this.pollingstationsAll[i].name === pollingStationName) {
          const temp = filterData(this.pollingstationsAll[i], committeetype, assignedstatus);
          for (const j in this.pollingstations) {
            if (this.pollingstations[j] && this.pollingstations[j].name === temp.name) {
              this.pollingstations[j].users = temp.users;
              break;
            }
          }
        }
      }
    }
  }

  addUsersStatus(attendance, pollingstation, type, attended) {
    this.users = [];
    const pollingStations = {};
    this.clearPollingStationsWitnessInfo();
    for (const i in attendance) {
      if (attendance[i] && attendance[i].pollingStation) {
        if (pollingStations[attendance[i].pollingStation.name]) {
          pollingStations[attendance[i].pollingStation.name].push(new UserModel(attendance[i]));
        } else {
          pollingStations[attendance[i].pollingStation.name] = [];
          pollingStations[attendance[i].pollingStation.name].push(new UserModel(attendance[i]));
        }
      }
    }
    for (const i in this.pollingstationsAll) {
      if (this.pollingstationsAll[i] && pollingStations && pollingStations[this.pollingstationsAll[i].name]) {
        this.pollingstationsAll[i].users = pollingStations[this.pollingstationsAll[i].name];
      }
    }
    this.applyFiltersPollingStation(pollingstation && pollingstation.name ? pollingstation.name : 'All', type, attended);
    this.calculateAttendanceStatus(this.pollingstations);
  }

  addAssignedKiosks(kiosksAssigned) {
    // this.kioskassigned = [];
    // let pollingStations = {};
    // for (let i = 0; i < kiosksAssigned.length; i++) {
    //   this.kioskassigned.push(new KiosksAssign(kiosksAssigned[i]));
    //   if (kiosksAssigned[i] &&  pollingStations[kiosksAssigned[i].pollingStationID]
    //     && pollingStations[kiosksAssigned[i].pollingStationID].kiosks
    //     && pollingStations[kiosksAssigned[i].pollingStationID].kiosks[kiosksAssigned[i].kioskId]
    //     && pollingStations[kiosksAssigned[i].pollingStationID].kiosks[kiosksAssigned[i].kioskId].members) {
    //     pollingStations[kiosksAssigned[i].pollingStationID].kiosks[kiosksAssigned[i].kioskId].members.push(new KiosksAssign(kiosksAssigned[i]));
    //   } else if (kiosksAssigned[i] &&  pollingStations[kiosksAssigned[i].pollingStationID]
    //     && pollingStations[kiosksAssigned[i].pollingStationID].kiosks
    //     && !pollingStations[kiosksAssigned[i].pollingStationID].kiosks[kiosksAssigned[i].kioskId]) {
    //     pollingStations[kiosksAssigned[i].pollingStationID].kiosks[kiosksAssigned[i].kioskId] = {
    //       kiosk: new Kiosks(kiosksAssigned[i].kiosks),
    //       members: [new KiosksAssign(kiosksAssigned[i])]
    //     };
    //   } else {
    //     pollingStations[kiosksAssigned[i].pollingStationID] = {
    //       pollingStation : new PollingStation(kiosksAssigned[i].pollingStation),
    //       kiosks : {
    //         [kiosksAssigned[i].kioskId]: {
    //           kiosk: new Kiosks(kiosksAssigned[i].kiosks),
    //           members: [new KiosksAssign(kiosksAssigned[i])]
    //         }
    //       }
    //     };
    //   }
    // }
    // this.pollingStations = [];
    // for (const i in pollingStations) {
    //   if (pollingStations && pollingStations[i]) {
    //     let kiosks: any = [];
    //     for (const j in pollingStations[i].kiosks) {
    //       if (pollingStations[i].kiosks && pollingStations[i].kiosks[j]) {
    //         kiosks.push(pollingStations[i].kiosks[j]);
    //       }
    //     }
    //     pollingStations[i].kiosks = kiosks;
    //     this.pollingStations.push(pollingStations[i]);
    //   }
    // }
  }

}

export class ShowSelectionViewGoveronrate {
  public governorate = true;
  public pollingstation = true;
  public wilayat = true;

  constructor(props) {
    this.governorate = props.governorate ? props.governorate : true;
    this.pollingstation = props.pollingstation ? props.pollingstation : true;
    this.wilayat = props.wilayat ? props.wilayat : true;
  }

  resetView(props) {
    this.governorate = props.governorate ? props.governorate : true;
    this.pollingstation = props.pollingstation ? props.pollingstation : true;
    this.wilayat = props.wilayat ? props.wilayat : true;
  }

  set(key, value) {
    if (this[key]) {
      this[key] = value;
    }
  }
}

export class KiosksModel {
  public governorates: Array<Governorate> = [];
  public wilayats: Array<Wilayat> = [];
  public pollingstations: Array<PollingStation> = [];
  public governorate: Governorate = new Governorate({});
  public wilayat: Wilayat = new Wilayat({});
  public pollingstation = new PollingStation({});
  public show = new ShowSelectionViewGoveronrate({});
  public kiosks: Array<Kiosks> = []; // used in assign kioskstouserpage
  public kiosk: Kiosks;
  public currentTab = 'assigned';
  public assigned = 'any';
  public users: Array<UserModel> = [];
  public filteredusers: Array<UserModel> = [];
  public user: User;
  public bankDetails: BankDetails;
  public languageselected = 'ar';

  constructor() {
    this.bankDetails = new BankDetails({});
  }

  setGovernate(governorate: Governorate) {
    this.governorate = governorate;
  }

  setWilayat(wilayat: Wilayat) {
    this.wilayat = wilayat;
  }

  setPollingStation(pollingStation: PollingStation) {
    this.pollingstation = pollingStation;
  }

  setKiosksSelected(kiosk) {
    this.kiosk = kiosk;
  }

  setUserSelected(user) {
    this.user = user;
  }
  setBankDetails(bankDetails) {
    this.bankDetails = bankDetails;
  }

  addGovernorates(governorates, options) {
    if (options && options.all === false) {
      this.governorates = [];
    } else {
      this.governorates = [new Governorate({
        id: 0,
        name: 'All',
        arabicName: 'الكل'
      })];
    }
    governorates.forEach((element) => {
      this.governorates.push(new Governorate(element));
    });
  }

  selectLanguage(lng: string) {
    this.languageselected = lng;
  }

  addWilayats(wilayats, options) {
    if (options && options.all === false) {
      this.wilayats = [];
    } else {
      this.wilayats = [new Wilayat({
        id: 0,
        name: 'All',
        arabicName: 'الكل'
      })];
    }
    wilayats.forEach((element) => {
      this.wilayats.push(new Wilayat(element));
    });
  }

  addPollingStations(pollingstations, options) {
    if (options && options.all === false) {
      this.pollingstations = [];
    } else {
      this.pollingstations = [new PollingStation({
        id: 0,
        name: 'All',
        arabicName: 'الكل'
      })];
    }
    pollingstations.forEach((element) => {
      this.pollingstations.push(new PollingStation(element));
    });
  }

  changeGovernorate(governorate) {
    for (const i in this.governorates) {
      if (this.governorates[i] &&
        this.governorates[i].name === governorate) {
        this.governorate = new Governorate(this.governorates[i]);
        this.wilayat = new Wilayat({});
        this.pollingstation = new PollingStation({});
      }
    }
  }

  changeWilayat(wilayat) {
    for (const i in this.wilayats) {
      if (this.wilayats[i] &&
        this.wilayats[i].name === wilayat) {
        this.wilayat = new Wilayat(this.wilayats[i]);
        this.pollingstation = new PollingStation({});
      }
    }
  }

  changePollingStation(pollingstation) {
    for (const i in this.pollingstations) {
      if (this.pollingstations[i] &&
        this.pollingstations[i].name === pollingstation) {
        this.pollingstation = new PollingStation(this.pollingstations[i]);
      }
    }
  }

  changeTab(value: string, assigned) {
    this.currentTab = String(value);
    this.assigned = assigned;
  }

  setKiosksList(kiosks: any) {
    this.kiosks = [];
    for (const i in kiosks) {
      if (kiosks[i]) {
        this.kiosks.push(kiosks[i]);
      }
    }
  }

  setUsersList(users: any, user) {
    this.users = [];
    for (const i in users) {
      if (users[i] && users[i].roles) {
        const name = users[i].roles.name;
        if ((name === 'committee_head_voting' || name === 'polling_station_supervisor_voting' || name === 'committee_member_voting') &&
          (user.roles.name === 'committee_head_voting' || user.roles.name === 'polling_station_supervisor_voting')) {
          this.users.push(new UserModel(users[i]));
        } else if ((name === 'committee_head_counting' || name === 'polling_station_supervisor_counting' ||
          name === 'committee_member_counting') && (user.roles.name === 'committee_head_counting' ||
          user.roles.name === 'polling_station_supervisor_counting')) {
          this.users.push(new UserModel(users[i]));
        } else if ((name === 'committee_head_organizing' || name === 'polling_station_supervisor_organizing' ||
          name === 'committee_member_organizing') && (user.roles.name === 'committee_head_organizing' ||
          user.roles.name === 'polling_station_supervisor_organizing')) {
          this.users.push(new UserModel(users[i]));
        }
      }
    }
  }

  setUsers(users: any, pollingstation: PollingStation) {
    const applyFiltersPollingStation = (pollingstationname: string) => {
      const users = [];
      for (const i in this.users) {
        // tslint:disable-next-line:no-unused-expression
        this.users[i].imageUrl ? true : this.users[i].gender === 'male' ? '/assets/contacts/male_' + Math.trunc((Math.random() * 100 % 6) + 1) + '.png' :
          '/assets/contacts/female_' + Math.trunc((Math.random() * 100 % 3) + 1) + '.png';
        if (pollingstationname !== 'الكل' && this.users && this.users[i] && this.users[i].pollingStation && this.users[i].pollingStation.name === pollingstationname) {
          users.push(this.users[i]);
        } else if (pollingstationname === 'الكل') {
          users.push(this.users[i]);
        }
      }
      return users;
    };
    this.users = [];
    for (const i in users) {
      if (users && users[i]) {
        this.users.push(new UserModel(users[i]));
      }
    }
    this.filteredusers = applyFiltersPollingStation(pollingstation && pollingstation.name ? pollingstation.name : 'الكل');
    return this.filteredusers;
  }
}

@Injectable({providedIn: 'root'})
export class APIService {
  constructor(private http: HttpClient) {
  }

  getAllWilayats() {
    const subscriberFunc = (observer) => {
      let url = ``;
      url = `${config.apiUrl}/wilayats`;
      return this.http.get<any>(url)
        .subscribe(wilayats => {
          // store user details and jwt token in local storage to keep user logged in between page refreshes
          observer.next(wilayats);
          return observer.complete();
        }, errors => {
          observer.error(errors);
        });
    };
    return new Observable(subscriberFunc);
  }

  getBankingDetails(userid) {
    const subscriberFunc = (observer) => {
      let url = ``;
      url = `${config.apiUrl}/bankingdetails/` + userid;
      return this.http.get<any>(url)
        .subscribe(bankingdetails => {
          // store user details and jwt token in local storage to keep user logged in between page refreshes
          observer.next(bankingdetails);
          return observer.complete();
        }, errors => {
          observer.error(errors);
        });
    };
    return new Observable(subscriberFunc);
  }

  getWilayats(governorate) {
    const subscriberFunc = (observer) => {
      let url = ``;
      if (governorate.code) {
        url = `${config.apiUrl}/wilayats/governorate/` + governorate.code;
      } else {
        url = `${config.apiUrl}/wilayats`;
      }
      return this.http.get<any>(url)
        .subscribe(wilayats => {
          // store user details and jwt token in local storage to keep user logged in between page refreshes
          observer.next(wilayats);
          return observer.complete();
        }, errors => {
          observer.error(errors);
        });
    };
    return new Observable(subscriberFunc);
  }
  getWilayatsById(wilayatCode: string) {
    const subscriberFunc = (observer) => {
      let url = ``;
      url = `${config.apiUrl}/wilayats/` + wilayatCode;
      return this.http.get<any>(url)
        .subscribe(wilayats => {
          // store user details and jwt token in local storage to keep user logged in between page refreshes
          observer.next(wilayats);
          return observer.complete();
        }, errors => {
          observer.error(errors);
        });
    };
    return new Observable(subscriberFunc);
  }

  getUsersOfWilayatWithRoleId(wilayatcode, rolecode) {
    const subscriberFunc = (observer) => {
      this.http.get(`${config.apiUrl}/users/wilayat/` + wilayatcode + `/` + rolecode)
        .subscribe(users => {
          // store user details and jwt token in local storage to keep user logged in between page refreshes
          observer.next(users);
          return observer.complete();
        }, errors => {
          observer.error(errors);
        });
    };
    return new Observable(subscriberFunc);
  }

  getPollingStations(wilayat) {
    const subscriberFunc = (observer) => {
      let url = ``;
      if (wilayat.code) {
        url = `${config.apiUrl}/pollingstation/wilayat/` + wilayat.code;
      } else {
        url = `${config.apiUrl}/pollingstation`;
      }
      return this.http.get<any>(url)
        .subscribe(pollingstations => {
          // store user details and jwt token in local storage to keep user logged in between page refreshes
          observer.next(pollingstations);
          return observer.complete();
        }, errors => {
          observer.error(errors);
        });
    };
    return new Observable(subscriberFunc);
  }

  getGovernates() {
    const subscriberFunc = (observer) => {
      this.http.get(`${config.apiUrl}/governorates`)
        .subscribe(governorates => {
          // store user details and jwt token in local storage to keep user logged in between page refreshes
          observer.next(governorates);
          return observer.complete();
        }, errors => {
          observer.error(errors);
        });
    };
    return new Observable(subscriberFunc);
  }

  getKiosksAssignedStatusByWilayatId(id: string) {
    const subscriberFunc = (observer) => {
      this.http.get(`${config.apiUrl}/kiosks/wilayat/assigned/` + id)
        .subscribe(kiosksAssigned => {
          // store user details and jwt token in local storage to keep user logged in between page refreshes
          observer.next(kiosksAssigned);
          return observer.complete();
        }, errors => {
          observer.error(errors);
        });
    };
    return new Observable(subscriberFunc);
  }

  getVotingStatusByWilayatId(id: string) {
    const subscriberFunc = (observer) => {
      const temp = `${config.apiUrl}/kiosks/voting/wilayat/` + id;
      this.http.get(temp)
        .subscribe(kiosks => {
          // store user details and jwt token in local storage to keep user logged in between page refreshes
          observer.next(kiosks);
          return observer.complete();
        }, errors => {
          observer.error(errors);
        });
    };
    return new Observable(subscriberFunc);
  }
  getVotingStatusAll() {
    const subscriberFunc = (observer) => {
      const temp = `${config.apiUrl}/kiosks/voting/all`;
      this.http.get(temp)
        .subscribe(kiosks => {
          // store user details and jwt token in local storage to keep user logged in between page refreshes
          observer.next(kiosks);
          return observer.complete();
        }, errors => {
          observer.error(errors);
        });
    };
    return new Observable(subscriberFunc);
  }

  getKiosksStatusByGovernorateId(id: string) {
    const subscriberFunc = (observer) => {
      this.http.get(`${config.apiUrl}/kiosks/governorate/assigned/` + id)
        .subscribe(kiosksAssigned => {
          // store user details and jwt token in local storage to keep user logged in between page refreshes
          observer.next(kiosksAssigned);
          return observer.complete();
        }, errors => {
          observer.error(errors);
        });
    };
    return new Observable(subscriberFunc);
  }

  getKiosksStatusAll() {
    const subscriberFunc = (observer) => {
      this.http.get(`${config.apiUrl}/kiosks/assigned/`)
        .subscribe(kiosksAssigned => {
          // store user details and jwt token in local storage to keep user logged in between page refreshes
          observer.next(kiosksAssigned);
          return observer.complete();
        }, errors => {
          observer.error(errors);
        });
    };
    return new Observable(subscriberFunc);
  }

  getKiosksByPollingStationId(id: number) {
    const subscriberFunc = (observer) => {
      this.http.get(`${config.apiUrl}/kiosks/pollingstation/` + id)
        .subscribe(kiosks => {
          // store user details and jwt token in local storage to keep user logged in between page refreshes
          observer.next(kiosks);
          return observer.complete();
        }, errors => {
          observer.error(errors);
        });
    };
    return new Observable(subscriberFunc);
  }

  getUsersByPollingStationId(id: number) {
    const subscriberFunc = (observer) => {
      this.http.get(`${config.apiUrl}/users/pollingstation/` + id)
        .subscribe(users => {
          // store user details and jwt token in local storage to keep user logged in between page refreshes
          observer.next(users);
          return observer.complete();
        }, errors => {
          observer.error(errors);
        });
    };
    return new Observable(subscriberFunc);
  }

  getAttendanceStatusByWilayatId(id: string) {
    const subscriberFunc = (observer) => {
      this.http.get(`${config.apiUrl}/kiosksassignment/wilayat/attendance/` + id)
        .subscribe(attedance => {
          // store user details and jwt token in local storage to keep user logged in between page refreshes
          observer.next(attedance);
          return observer.complete();
        }, errors => {
          observer.error(errors);
        });
    };
    return new Observable(subscriberFunc);
  }

  getAttendanceStatusAll() {
    const subscriberFunc = (observer) => {
      this.http.get(`${config.apiUrl}/kiosksassignment/attendance/`)
        .subscribe(attedance => {
          // store user details and jwt token in local storage to keep user logged in between page refreshes
          observer.next(attedance);
          return observer.complete();
        }, errors => {
          observer.error(errors);
        });
    };
    return new Observable(subscriberFunc);
  }

  getAttendanceStatusByGovernorateId(id: string) {
    const subscriberFunc = (observer) => {
      this.http.get(`${config.apiUrl}/kiosksassignment/governorate/attendance/` + id)
        .subscribe(attedance => {
          // store user details and jwt token in local storage to keep user logged in between page refreshes
          observer.next(attedance);
          return observer.complete();
        }, errors => {
          observer.error(errors);
        });
    };
    return new Observable(subscriberFunc);
  }

  getKioskById(id: any) {
    // alert(`${config.apiUrl}/kiosks/serial/` + id);
    const subscriberFunc = (observer) => {
      this.http.get(`${config.apiUrl}/kiosks/serial/` + id)
        .subscribe(kiosks => {
          // store user details and jwt token in local storage to keep user logged in between page refreshes
          observer.next(kiosks);
          return observer.complete();
        }, errors => {
          observer.error(errors);
        });
    };
    return new Observable(subscriberFunc);
  }

  assignPollingStationToUsers(pollingstation, assignpollingstation, user) {
    const decideNewRole = (issupervisor) => {
      if (issupervisor) {
        if (user.roleId === 4) {
          return 6;
        } else if (user.roleId === 5) {
          return 7;
        } else if (user.roleId === 1002) {
          return 1003;
        }
      } else {
        if (user.roleId === 4) {
          return 8;
        } else if (user.roleId === 5) {
          return 9;
        } else if (user.roleId === 1002) {
          return 1004;
        }
      }
    };
    const processUsers = () => {
      let users = [];
      // Get changes for the users
      const tempusers = assignpollingstation.getSelectedMembers();
      const setPollingStationForUser = (userbyindex, pollingstationid) => {
        userbyindex.roleId = decideNewRole(false);
        userbyindex.pollingStationId = pollingstationid;
        tempuser = new UserModel(userbyindex);
        tempuser.removeKeys(['kiosks', 'roles', 'wilayat', 'pollingStation', 'kiosksAssigned', 'governorate']);
        users.push(tempuser);
        return users;
      };
      // remove previous supervisor incase if its alloted
      if (tempusers.previousSupervisor && tempusers.previousSupervisor.roleId) {
        tempusers.previousSupervisor.roleId = decideNewRole(false);
        tempusers.previousSupervisor.pollingStationId = 111; // pollingstation 111 is added in database as None
        const tempuser = new UserModel(tempusers.previousSupervisor);
        tempuser.removeKeys(['kiosks', 'roles', 'wilayat', 'pollingStation', 'kiosksAssigned', 'governorate']);
        users.push(tempuser);
      }
      // remove pollingstation for users who are previously alloted for the same pollingstation 111 is added in database as None
      for (const i in tempusers.unselectedusers) {
        if (tempusers.unselectedusers[i]) {
          users = setPollingStationForUser(tempusers.unselectedusers[i], 111);
        }
      }
      // set pollingstation for the users;
      for (const i in tempusers.selectedusers) {
        if (tempusers.selectedusers[i]) {
          users = setPollingStationForUser(tempusers.selectedusers[i], pollingstation.id);
        }
      }
      // set the new supervisor
      assignpollingstation.supervisor.roleId = decideNewRole(true);
      assignpollingstation.supervisor.pollingStationId = pollingstation.id;
      let tempuser = new UserModel(assignpollingstation.supervisor);
      tempuser.removeKeys(['kiosks', 'roles', 'wilayat', 'pollingStation', 'kiosksAssigned', 'governorate']);
      users.push(tempuser);
      return users;
    };
    const subscriberFunc = (observer) => {
      this.http.post<any>(`${config.apiUrl}/users/assignpollingstationusers`, processUsers()).subscribe(kiosks => {
        // store user details and jwt token in local storage to keep user logged in between page refreshes
        observer.next(kiosks);
        return observer.complete();
      }, errors => {
        observer.error(errors);
      });
    };
    return new Observable(subscriberFunc);
  }

  assignKiosksToUser(assignedById, assignedToId, kiosksId, PollingStationID) {
    const subscriberFunc = (observer) => {
      return this.http.post<any>(`${config.apiUrl}/kiosksassignment/assignUserToKiosks`, {
        MemberId: assignedToId,
        AssignedBy: assignedById,
        KioskId: kiosksId,
        PollingStationID,
        isDeleted: false
      })
        .subscribe(success => {
          // store user details and jwt token in local storage to keep user logged in between page refreshes
          observer.next(success);
          return observer.complete();
        }, errors => {
          observer.error(errors);
        });
    };
    return new Observable(subscriberFunc);
  }

  updateKiosksToUser(id, assignedById, assignedToId, kiosksId, PollingStationID) {
    const subscriberFunc = (observer) => {
      if (id) {
        return this.http.put<any>(`${config.apiUrl}/kiosksassignment/` + id, {
          MemberId: assignedToId,
          AssignedBy: assignedById,
          KioskId: kiosksId,
          PollingStationID,
          isDeleted: false
        })
          .subscribe(success => {
            // store user details and jwt token in local storage to keep user logged in between page refreshes
            observer.next(success);
            return observer.complete();
          }, errors => {
            observer.error(errors);
          });
      } else {
        return this.http.post<any>(`${config.apiUrl}/kiosksassignment/assignUserToKiosks`, {
          MemberId: assignedToId,
          AssignedBy: assignedById,
          KioskId: kiosksId,
          PollingStationID,
          isDeleted: false
        })
          .subscribe(success => {
            // store user details and jwt token in local storage to keep user logged in between page refreshes
            observer.next(success);
            return observer.complete();
          }, errors => {
            observer.error(errors);
          });
      }
    };
    return new Observable(subscriberFunc);
  }

  getKiosksAssignedStatusByPollingStationId(id: any) {
    const subscriberFunc = (observer) => {
      this.http.get(`${config.apiUrl}/kiosksassignment/pollingstation/` + id)
        .subscribe(kiosks => {
          // store user details and jwt token in local storage to keep user logged in between page refreshes
          observer.next(kiosks);
          return observer.complete();
        }, errors => {
          observer.error(errors);
        });
    };
    return new Observable(subscriberFunc);
  }

  getWitnessStatusByWilayatId(code: any) {
    const subscriberFunc = (observer) => {
      this.http.get(`${config.apiUrl}/Witnesses/wilayat/` + code)
        .subscribe(witnesses => {
          // store user details and jwt token in local storage to keep user logged in between page refreshes
          observer.next(witnesses);
          return observer.complete();
        }, errors => {
          observer.error(errors);
        });
    };
    return new Observable(subscriberFunc);
  }

  getWitnessStatusAll() {
    const subscriberFunc = (observer) => {
      this.http.get(`${config.apiUrl}/Witnesses`)
        .subscribe(witnesses => {
          // store user details and jwt token in local storage to keep user logged in between page refreshes
          observer.next(witnesses);
          return observer.complete();
        }, errors => {
          observer.error(errors);
        });
    };
    return new Observable(subscriberFunc);
  }

  getWitnessStatusByGovernorateId(code: any) {
    const subscriberFunc = (observer) => {
      this.http.get(`${config.apiUrl}/Witnesses/governorate/` + code)
        .subscribe(witnesses => {
          // store user details and jwt token in local storage to keep user logged in between page refreshes
          observer.next(witnesses);
          return observer.complete();
        }, errors => {
          observer.error(errors);
        });
    };
    return new Observable(subscriberFunc);
  }

  getUsersStatusAll() {
    const subscriberFunc = (observer) => {
      this.http.get(`${config.apiUrl}/users`)
        .subscribe(users => {
          // store user details and jwt token in local storage to keep user logged in between page refreshes
          observer.next(users);
          return observer.complete();
        }, errors => {
          observer.error(errors);
        });
    };
    return new Observable(subscriberFunc);
  }

  getUsersStatusByGovernorateId(code: any) {
    const subscriberFunc = (observer) => {
      this.http.get(`${config.apiUrl}/users/governorate/` + code)
        .subscribe(users => {
          // store user details and jwt token in local storage to keep user logged in between page refreshes
          observer.next(users);
          return observer.complete();
        }, errors => {
          observer.error(errors);
        });
    };
    return new Observable(subscriberFunc);
  }

  getUsersStatusByWilayatId(code: any) {
    const subscriberFunc = (observer) => {
      this.http.get(`${config.apiUrl}/users/wilayat/` + code)
        .subscribe(users => {
          // store user details and jwt token in local storage to keep user logged in between page refreshes
          observer.next(users);
          return observer.complete();
        }, errors => {
          observer.error(errors);
        });
    };
    return new Observable(subscriberFunc);
  }

  getCountingAppUserDetailsByWilayatIdRoleId(code, roleid) {
    const subscriberFunc = (observer) => {
      this.http.get(`${config.apiUrl}/countingsoftware/wilayat/` + code + `/` + roleid)
        .subscribe(user => {
          // store user details and jwt token in local storage to keep user logged in between page refreshes
          observer.next(user);
          return observer.complete();
        }, errors => {
          observer.error(errors);
        });
    };
    return new Observable(subscriberFunc);
  }

  getCountingAppUserDetailsByRoleId(roleid) {
    const subscriberFunc = (observer) => {
      this.http.get(`${config.apiUrl}/countingsoftware/wilayat/role/` + roleid)
        .subscribe(user => {
          // store user details and jwt token in local storage to keep user logged in between page refreshes
          observer.next(user);
          return observer.complete();
        }, errors => {
          observer.error(errors);
        });
    };
    return new Observable(subscriberFunc);
  }

  postWitnessId(data) {
    const subscriberFunc = (observer) => {
      return this.http.post<any>(`${config.apiUrl}/Witnesses`, data)
        .subscribe(success => {
          // store user details and jwt token in local storage to keep user logged in between page refreshes
          observer.next(success);
          return observer.complete();
        }, errors => {
          observer.error(errors);
        });
    };
    return new Observable(subscriberFunc);
  }

  createOrUpdateBankDetails(data) {
    const subscriberFunc = (observer) => {
      if (data.id) {
        return this.http.put<any>(`${config.apiUrl}/bankingdetails`, data)
          .subscribe(success => {
            // store user details and jwt token in local storage to keep user logged in between page refreshes
            observer.next(success);
            return observer.complete();
          }, errors => {
            observer.error(errors);
          });
      } else {
        delete data.id;
        return this.http.post<any>(`${config.apiUrl}/bankingdetails`, data)
          .subscribe(success => {
            // store user details and jwt token in local storage to keep user logged in between page refreshes
            observer.next(success);
            return observer.complete();
          }, errors => {
            observer.error(errors);
          });
      }
    };
    return new Observable(subscriberFunc);
  }

  getUsersForPollingStation(user: User, pollingStation: PollingStation) {
    const seggregateUsers = (user: any, usersfetched: any) => {
      let tempusers = [], supervisor: User;
      for (const i in usersfetched) {
        if (usersfetched[i] && usersfetched[i].roleId > 5) {
          // check if user is already assigned
          if (usersfetched[i] && usersfetched[i].pollingStation && usersfetched[i].pollingStation.id) {
            if (usersfetched[i] && usersfetched[i].pollingStation && usersfetched[i].pollingStation.id &&
              (usersfetched[i].roleId === 7 || usersfetched[i].roleId === 6 || usersfetched[i].roleId === 1003)) {
              if (user.roles && user.roles.name === 'committee_head_voting' && usersfetched[i].roleId === 6 && pollingStation.id === usersfetched[i].pollingStation.id) {
                usersfetched[i].selected = true;
                supervisor = usersfetched[i];
              } else if (user.roles && user.roles.name === 'committee_head_counting ' && usersfetched[i].roleId === 7 && pollingStation.id === usersfetched[i].pollingStation.id) {
                usersfetched[i].selected = true;
                supervisor = usersfetched[i];
              } else if (user.roles && user.roles.name === 'committee_head_organizing ' && usersfetched[i].roleId === 1002 && pollingStation.id === usersfetched[i].pollingStation.id) {
                usersfetched[i].selected = true;
                supervisor = usersfetched[i];
              }
            } else if (usersfetched[i].pollingStation && pollingStation.id === usersfetched[i].pollingStation.id) {
              usersfetched[i].selected = true;
            }
          }
          // seggregate to committees
          if (user.roles.name === 'committee_head_voting' && (usersfetched[i].roleId === 6 || usersfetched[i].roleId === 8)) {
            tempusers.push(usersfetched[i]);
          } else if (user.roles.name === 'committee_head_counting' && (usersfetched[i].roleId === 7 || usersfetched[i].roleId === 9)) {
            tempusers.push(usersfetched[i]);
          } else if (user.roles.name === 'committee_head_organizing' && (usersfetched[i].roleId === 1003 || usersfetched[i].roleId === 1004)) {
            tempusers.push(usersfetched[i]);
          }
        }
      }
      return {
        users: tempusers,
        supervisor
      };
    };
    const subscriberFunc = (observer) => {
      this.http.get(`${config.apiUrl}/users/wilayat/` + user.wilayatCode)
        .subscribe(users => {
          // store user details and jwt token in local storage to keep user logged in between page refreshes
          observer.next(seggregateUsers(user, users));
          return observer.complete();
        }, errors => {
          observer.error(errors);
        });
    };
    return new Observable(subscriberFunc);
  }
}

@Injectable({providedIn: 'root'})
export class VotingStatusModel {
  public pollingstations: any = [];
  public wilayat: Wilayat;
  public wilayats: Array<Wilayat> = [];
  public votingpercentage = 0.0;
  public registeredVoters = 0;
  public totalvotescasted = 0;
  constructor(props) {
  }

  addWilayat(wilayat) {
    this.wilayat = new Wilayat(wilayat);
    this.wilayats = [];
  }

  addWilayats(wilayats) {
    this.wilayats = [];
    this.wilayat = undefined;
    for (const i in wilayats) {
      if (wilayats && wilayats[i]) {
        this.wilayats.push(new Wilayat(wilayats[i]));
      }
    }
  }

  addVotingKiosks(kiosklist, pollingstation, type) {
    const pollingStations = {};
    this.votingpercentage = 0.0;
    this.registeredVoters = 0;
    this.totalvotescasted = 0;
    this.pollingstations = [];
    for (const i in kiosklist) {
      if (kiosklist[i] && kiosklist[i].id) {
        if (kiosklist[i].noOfVotes) {
          this.totalvotescasted += kiosklist[i].noOfVotes;
        }
        if (pollingStations[kiosklist[i].pollingStation.name]) {
          pollingStations[kiosklist[i].pollingStation.name].kiosks.push(new Kiosks(kiosklist[i]));
        } else {
          pollingStations[kiosklist[i].pollingStation.name] = {
            name: kiosklist[i].pollingStation.name,
            arabicName: kiosklist[i].pollingStation.arabicName,
            kiosks: []
          };
          pollingStations[kiosklist[i].pollingStation.name].kiosks.push(new Kiosks(kiosklist[i]));
        }
      }
    }
    for (const j in pollingStations) {
      if (pollingStations && pollingStations[j]) {
        this.pollingstations.push({name: pollingStations[j].name, arabicName: pollingStations[j].arabicName,
          kiosks: pollingStations[j].kiosks});
      }
    }
    this.registeredVoters = 0;
    if (this.wilayats && this.wilayats.length) {
      for (const i in this.wilayats) {
        if (this.wilayats && this.wilayats[i]) {
          this.registeredVoters += (this.wilayats[i].RegisteredFemaleVoters + this.wilayats[i].RegisteredMaleVoters);
        }
      }
    } else {
      this.registeredVoters = this.wilayat.RegisteredFemaleVoters + this.wilayat.RegisteredMaleVoters;
    }

    this.votingpercentage = this.registeredVoters ? (this.totalvotescasted / this.registeredVoters) * 100 : 0;
  }

}

@Injectable({providedIn: 'root'})
export class VotingStatusService {
  public currentDataServiceSubject: BehaviorSubject<VotingStatusModel>;
  public currentDataService: Observable<VotingStatusModel>;

  constructor(private http: HttpClient, private apiService: APIService) {
    this.currentDataServiceSubject = new BehaviorSubject<VotingStatusModel>(new VotingStatusModel({}));
    this.currentDataService = this.currentDataServiceSubject.asObservable();
  }

  public get currentDataServiceSubjectValue(): VotingStatusModel {
    return this.currentDataServiceSubject.value;
  }

  getWilayatByCode(code: string) {
    const subscriberFunc = (observer) => {
      if (code) {
        this.apiService.getWilayatsById(code).subscribe((success: any) => {
          if (success && success.length) {
            this.currentDataServiceSubject.value.addWilayat(success[0]);
            this.currentDataServiceSubject.next(this.currentDataServiceSubject.value);
          }
          observer.next(success);
        }, (errors) => {
          observer.error(errors);
        }, () => {
          return observer.complete();
        });
      } else {
        this.apiService.getAllWilayats().subscribe((success: any) => {
          if (success && success.length) {
            this.currentDataServiceSubject.value.addWilayats(success);
            this.currentDataServiceSubject.next(this.currentDataServiceSubject.value);
          }
          observer.next(success);
        }, (errors) => {
          observer.error(errors);
        }, () => {
          return observer.complete();
        });
      }
    };
    return new Observable(subscriberFunc);
  }

  getKiosksStatusByWilayatId(id: string, pollingstation, type: string) {
    const subscriberFunc = (observer) => {
      if (id === null) {
        this.apiService.getVotingStatusAll().subscribe((success) => {
          this.currentDataServiceSubject.value.addVotingKiosks(success, pollingstation, type);
          this.currentDataServiceSubject.next(this.currentDataServiceSubject.value);
          observer.next(this.currentDataServiceSubject.value);
        }, (errors) => {
          observer.error(errors);
        }, () => {
          return observer.complete();
        });
      } else {
        this.apiService.getVotingStatusByWilayatId(id).subscribe((success) => {
          this.currentDataServiceSubject.value.addVotingKiosks(success, pollingstation, type);
          this.currentDataServiceSubject.next(this.currentDataServiceSubject.value);
          observer.next(this.currentDataServiceSubject.value);
        }, (errors) => {
          observer.error(errors);
        }, () => {
          return observer.complete();
        });
      }
    };
    return new Observable(subscriberFunc);
  }
}

@Injectable({providedIn: 'root'})
export class KiosksStatusModel {
  public kiosks: Array<Kiosks> = [];
  public pollingstations: any = [];
  public pollingstationsAll: any = [];
  public kiosksStatus: any = {total: 0, opened: 0, locked: 0, closed: 0};

  public selectedUser: User;
  public selectedPollingStation: PollingStation;
  public selectedKiosksSelected: any;

  constructor() {

  }

  setDataToRedirect(pollingStation: PollingStation, kiosk: any, user: User) {
    this.selectedPollingStation = pollingStation;
    this.selectedKiosksSelected = kiosk;
    this.selectedUser = user;
  }

  updatePollingStationKeys(pollingstations: Array<PollingStation>) {
    this.pollingstations = [];
    this.pollingstationsAll = [];
    for (const i in pollingstations) {
      if (pollingstations[i] && pollingstations[i].id) {
        this.pollingstations.push({name: pollingstations[i].name, arabicName: pollingstations[i].arabicName, kiosks: []});
        this.pollingstationsAll.push({name: pollingstations[i].name, arabicName: pollingstations[i].arabicName, kiosks: []});
      }
    }
  }

  setPollingStationKeys(pollingStationname) {
    this.pollingstations = [];
    for (const i in this.pollingstationsAll) {
      if (pollingStationname && pollingStationname === this.pollingstationsAll[i].name && pollingStationname !== 'All') {
        this.pollingstations.push({name: this.pollingstationsAll[i].name, arabicName: this.pollingstationsAll[i].arabicName, kiosks: []});
      } else if (this.pollingstationsAll[i] && this.pollingstationsAll[i].name && pollingStationname === undefined) {
        this.pollingstations.push({name: this.pollingstationsAll[i].name, arabicName: this.pollingstationsAll[i].arabicName, kiosks: []});
      }
    }
  }

  clearPollingStationsWitnessInfo() {
    for (const i in this.pollingstations) {
      if (this.pollingstations[i]) {
        this.pollingstations[i].kiosks = [];
        this.pollingstationsAll[i].kiosks = [];
      }
    }
  }

  calculateKiosksStatus(pollingstations) {
    this.kiosksStatus = {total: 0, opened: 0, locked: 0, closed: 0};
    for (const i in pollingstations) {
      if (pollingstations[i] && pollingstations[i].kiosks) {
        this.kiosksStatus.total += pollingstations[i].kiosks.length;
        for (const j in pollingstations[i].kiosks) {
          if (pollingstations[i].kiosks[j].openTime && pollingstations[i].kiosks[j].closeTime) {
            this.kiosksStatus.closed++;
          } else if (pollingstations[i].kiosks[j].openTime && !pollingstations[i].kiosks[j].closeTime) {
            this.kiosksStatus.opened++;
          } else if (!pollingstations[i].kiosks[j].openTime && !pollingstations[i].kiosks[j].closeTime) {
            this.kiosksStatus.locked++;
          }
        }
      }
    }
  }

  applyFiltersPollingStation(pollingStationName, committeetype, assignedstatus) {
    const filterData = (pollingStation, type, assigned) => {
      const kiosks = [];
      for (const i in pollingStation.kiosks) {
        if (assigned === 'assigned' && pollingStation.kiosks[i].kioskassigned && pollingStation.kiosks[i].kioskassigned.length) {
          kiosks.push(pollingStation.kiosks[i]);
        } else if (assigned === 'unassigned' && pollingStation.kiosks[i].kioskassigned && pollingStation.kiosks[i].kioskassigned.length === 0) {
          kiosks.push(pollingStation.kiosks[i]);
        } else if (assigned === 'any') {
          kiosks.push(pollingStation.kiosks[i]);
        }
      }
      return {name: pollingStation.name, kiosks};
    };
    if (pollingStationName === 'All') {
      this.setPollingStationKeys(undefined);
      for (const i in this.pollingstationsAll) {
        if (this.pollingstationsAll && this.pollingstationsAll[i].name) {
          const temp = filterData(this.pollingstationsAll[i], committeetype, assignedstatus);
          for (const j in this.pollingstations) {
            if (this.pollingstations[i] && this.pollingstations[i].name === temp.name) {
              this.pollingstations[i].kiosks = temp.kiosks;
              break;
            }
          }
        }
      }
    } else {
      this.setPollingStationKeys(pollingStationName);
      for (const i in this.pollingstationsAll) {
        if (this.pollingstationsAll && this.pollingstationsAll[i].name === pollingStationName) {
          const temp = filterData(this.pollingstationsAll[i], committeetype, assignedstatus);
          for (const j in this.pollingstations) {
            if (this.pollingstations[j] && this.pollingstations[j].name === temp.name) {
              this.pollingstations[j].kiosks = temp.kiosks;
              break;
            }
          }
        }
      }
    }
  }

  addAssignedKiosks(kiosksAssigned, pollingstation, type, assigned) {
    this.clearPollingStationsWitnessInfo();
    kiosksAssigned = _.groupBy(kiosksAssigned, 'id');
    // group list of kiosks memebers
    const kiosklist = [];
    for (const i in kiosksAssigned) {
      if (kiosksAssigned[i] && kiosksAssigned[i].length) {
        const temp = new KiosksStatusViewModel(kiosksAssigned[i][0]);
        if (kiosksAssigned[i][0].kiosksAssigned) {
          temp.kioskassigned = [new KiosksAssign(kiosksAssigned[i][0].kiosksAssigned)];
          for (let j = 1; j < kiosksAssigned[i].length; j++) {
            temp.kioskassigned.push(new KiosksAssign(kiosksAssigned[i][j].kiosksAssigned));
          }
        }
        kiosklist.push(temp);
      }
    }
    const pollingStations = {};
    for (const i in kiosklist) {
      if (kiosklist[i] && kiosklist[i].id) {
        if (pollingStations[kiosklist[i].pollingStation.name]) {
          pollingStations[kiosklist[i].pollingStation.name].push(kiosklist[i]);
        } else {
          pollingStations[kiosklist[i].pollingStation.name] = [];
          pollingStations[kiosklist[i].pollingStation.name].push(kiosklist[i]);
        }
      }
    }
    for (const i in this.pollingstationsAll) {
      if (this.pollingstationsAll[i] && pollingStations && pollingStations[this.pollingstationsAll[i].name]) {
        this.pollingstationsAll[i].kiosks = pollingStations[this.pollingstationsAll[i].name];
      }
    }
    this.calculateKiosksStatus(this.pollingstationsAll);
    this.applyFiltersPollingStation(pollingstation && pollingstation.name ? pollingstation.name : 'All', type, assigned);
  }

}

@Injectable({providedIn: 'root'})
export class DataService {
  public currentDataServiceSubject: BehaviorSubject<KiosksModel>;
  public currentDataService: Observable<KiosksModel>;

  constructor(private http: HttpClient, private apiService: APIService) {
    this.currentDataServiceSubject = new BehaviorSubject<KiosksModel>(new KiosksModel());
    this.currentDataService = this.currentDataServiceSubject.asObservable();
  }

  public get currentDataServiceSubjectValue(): KiosksModel {
    return this.currentDataServiceSubject.value;
  }

  getGovernates() {
    this.apiService.getGovernates().subscribe((success) => {
      this.currentDataServiceSubject.value.addGovernorates(success, {all: true});
      this.currentDataServiceSubject.next(this.currentDataServiceSubject.value);
    }, (errors) => {
      console.log(errors);
    }, () => {
      console.log('completed');
    });
  }

  setLanguage(lng: string) {
    this.currentDataServiceSubject.value.selectLanguage(lng);
    this.currentDataServiceSubject.next(this.currentDataServiceSubject.value);
  }

  onChangeGovernorate(event) {
    this.currentDataServiceSubject.value.changeGovernorate(event.detail.value);
    this.getWilayatFromGovernorateId(this.currentDataServiceSubject.value.governorate).subscribe(() => {
    }, () => {
    });
  }

  getWilayatFromGovernorateId(governorate: Governorate) {
    const subscriberFunc = (observer) => {
      this.apiService.getWilayats(governorate).subscribe((success) => {
        this.currentDataServiceSubject.value.addWilayats(success, {all: true});
        this.currentDataServiceSubject.next(this.currentDataServiceSubject.value);
        observer.next(success);
      }, (errors) => {
        console.log(errors);
        observer.error(errors);
      }, () => {
        return observer.complete();
      });
    };
    return new Observable(subscriberFunc);
  }

  onFocusGovernorates(event) {
    console.log(event);
  }

  onChangeWilayat(event) {
    this.currentDataServiceSubject.value.changeWilayat(event.detail.value);
    // this.currentDataServiceSubject.next(this.currentDataServiceSubject.value);
    this.apiService.getPollingStations(this.currentDataServiceSubject.value.wilayat).subscribe((success) => {
      this.currentDataServiceSubject.value.addPollingStations(success, {});
      this.currentDataServiceSubject.next(this.currentDataServiceSubject.value);
    }, (errors) => {
      console.log(errors);
    }, () => {
      console.log('completed');
    });
  }

  changeWilayat(event) {
    const subscriberFunc = (observer) => {
      this.currentDataServiceSubject.value.changeWilayat(event.detail.value);
      this.currentDataServiceSubject.next(this.currentDataServiceSubject.value);
      observer.next();
      return observer.complete();
    };
    return new Observable(subscriberFunc);
  }

  getPollingStationForWilayatId(wilayat: Wilayat, options: any) {
    this.apiService.getPollingStations(wilayat).subscribe((success) => {
      this.currentDataServiceSubject.value.addPollingStations(success, options);
      this.currentDataServiceSubject.next(this.currentDataServiceSubject.value);
    }, (errors) => {
      console.log(errors);
    }, () => {
      console.log('completed');
    });
  }

  setGovernate(governorate: Governorate) {
    this.currentDataServiceSubject.value.setGovernate(governorate);
    this.currentDataServiceSubject.next(this.currentDataServiceSubject.value);
  }

  setWilayat(wilayat: Wilayat) {
    this.currentDataServiceSubject.value.setWilayat(wilayat);
    this.currentDataServiceSubject.next(this.currentDataServiceSubject.value);
  }

  setPollingStation(pollingStation: PollingStation) {
    this.currentDataServiceSubject.value.setPollingStation(pollingStation);
    this.currentDataServiceSubject.next(this.currentDataServiceSubject.value);
  }

  onChangePollingStation(event) {
    this.currentDataServiceSubject.value.changePollingStation(event.detail.value);
    this.currentDataServiceSubject.next(this.currentDataServiceSubject.value);
  }

  getKiosksStatus(type: string) {
    this.apiService.getPollingStations(this.currentDataServiceSubject.value.wilayat).subscribe((success) => {
      this.currentDataServiceSubject.value.addPollingStations(success, {});
      this.currentDataServiceSubject.next(this.currentDataServiceSubject.value);
    }, (errors) => {
      console.log(errors);
    }, () => {
      console.log('completed');
    });
  }

  getKiosksByPollingStationId(pollingStation: PollingStation) {
    const subscriberFunc = (observer) => {
      return this.apiService.getKiosksByPollingStationId(pollingStation.id).subscribe((success) => {
        this.currentDataServiceSubject.value.setKiosksList(success);
        this.currentDataServiceSubject.next(this.currentDataServiceSubject.value);
        observer.next(success);
      }, (errors) => {
        observer.error(errors);
      }, () => {
        return observer.complete();
      });
    };
    return new Observable(subscriberFunc);
  }

  getUsersByPollingStationId(pollingStation: PollingStation, user: User) {
    const subscriberFunc = (observer) => {
      return this.apiService.getUsersByPollingStationId(pollingStation.id).subscribe((success) => {
        this.currentDataServiceSubject.value.setUsersList(success, user);
        this.currentDataServiceSubject.next(this.currentDataServiceSubject.value);
        observer.next(success);
      }, (errors) => {
        observer.error(errors);
      }, () => {
        return observer.complete();
      });
    };
    return new Observable(subscriberFunc);
  }

  getUserStatusByAll(pollingstation) {
    const subscriberFunc = (observer) => {
      this.apiService.getUsersStatusAll().subscribe((success) => {
        this.currentDataServiceSubject.value.setUsers(success, pollingstation);
        this.currentDataServiceSubject.next(this.currentDataServiceSubject.value);
        observer.next(success);
      }, (errors) => {
        observer.error(errors);
      }, () => {
        return observer.complete();
      });
    };
    return new Observable(subscriberFunc);
  }

  getUserStatusByGovernorateId(governoratecode, pollingstation) {
    const subscriberFunc = (observer) => {
      this.apiService.getUsersStatusByGovernorateId(governoratecode).subscribe((success) => {
        this.currentDataServiceSubject.value.setUsers(success, pollingstation);
        this.currentDataServiceSubject.next(this.currentDataServiceSubject.value);
        observer.next(success);
      }, (errors) => {
        observer.error(errors);
      }, () => {
        return observer.complete();
      });
    };
    return new Observable(subscriberFunc);
  }

  getUserstatusByWilayatId(wilayatid, pollingstation) {
    const subscriberFunc = (observer) => {
      this.apiService.getUsersStatusByWilayatId(wilayatid).subscribe((success) => {
        this.currentDataServiceSubject.value.setUsers(success, pollingstation);
        this.currentDataServiceSubject.next(this.currentDataServiceSubject.value);
        observer.next(success);
      }, (errors) => {
        observer.error(errors);
      }, () => {
        return observer.complete();
      });
    };
    return new Observable(subscriberFunc);
  }

  getUsersOfWilayatWithRoleId(wilayat: Wilayat, roleid: string) {
    const mapobject = {
      high_committee: 1,
      wali_officer: 2,
      wali_assistant: 3,
      committee_head_voting: 4,
      committee_head_counting: 5,
      polling_station_supervisor_voting: 6,
      polling_station_supervisor_counting: 7,
      committee_member_voting: 8,
      committee_member_counting: 9,
      committee_head_organizing: 1002,
      polling_station_supervisor_organizing: 1003,
      committee_member_organizing: 1004,
      main_committee: 2002
    };
    const subscriberFunc = (observer) => {
      if (wilayat.code) {
        this.apiService.getUsersOfWilayatWithRoleId(wilayat.code, mapobject[roleid]).subscribe((success: any) => {
          if (success && success.length) {
            this.currentDataServiceSubject.value.setUserSelected(new User(success[0]));
          } else {
            this.currentDataServiceSubject.value.setUserSelected(success);
          }
          this.currentDataServiceSubject.next(this.currentDataServiceSubject.value);
          observer.next(success);
        }, (errors) => {
          observer.error(errors);
        }, () => {
          return observer.complete();
        });
      } else {
        this.currentDataServiceSubject.value.setUserSelected(null);
        this.currentDataServiceSubject.next(this.currentDataServiceSubject.value);
        observer.next();
        return observer.complete();
      }
    };
    return new Observable(subscriberFunc);
  }

  getCountingAppUserDetailsByWilayatIdRoleId(code, id) {
    const subscriberFunc = (observer) => {
      this.apiService.getCountingAppUserDetailsByWilayatIdRoleId(code, id).subscribe((success) => {
        observer.next(success);
      }, (errors) => {
        observer.error(errors);
      }, () => {
        return observer.complete();
      });
    };
    return new Observable(subscriberFunc);
  }

  getCountingAppUserDetailsByRoleId(id) {
    const subscriberFunc = (observer) => {
      this.apiService.getCountingAppUserDetailsByRoleId(id).subscribe((success) => {
        observer.next(success);
      }, (errors) => {
        observer.error(errors);
      }, () => {
        return observer.complete();
      });
    };
    return new Observable(subscriberFunc);
  }

  setSelectedKiosks(kiosks) {
    this.currentDataServiceSubject.value.setKiosksSelected(kiosks);
    this.currentDataServiceSubject.next(this.currentDataServiceSubject.value);
  }

  setSelectedUsers(user) {
    this.currentDataServiceSubject.value.setUserSelected(user);
    this.currentDataServiceSubject.next(this.currentDataServiceSubject.value);
  }
  changeBankDetails(bankDetails) {
    // alert(JSON.stringify(bankDetails));
    const subscriberFunc = (observer) => {
      this.apiService.createOrUpdateBankDetails(bankDetails).subscribe((success) => {
        observer.next(success);
      }, (errors) => {
        observer.error(errors);
      }, () => {
        return observer.complete();
      });
    };
    return new Observable(subscriberFunc);
  }
  getBankingDetails(userid) {
    const subscriberFunc = (observer) => {
      this.apiService.getBankingDetails(userid).subscribe((success: any) => {
        if (success && success.length) {
          this.currentDataServiceSubject.value.setBankDetails(new BankDetails(success[0]));
        } else {
          this.currentDataServiceSubject.value.setBankDetails(new BankDetails({}));
        }
        this.currentDataServiceSubject.next(this.currentDataServiceSubject.value);
        observer.next(success);
      }, (errors) => {
        observer.error(errors);
      }, () => {
        return observer.complete();
      });
    };
    return new Observable(subscriberFunc);
  }
}


@Injectable({providedIn: 'root'})
export class AuthenticationService {
  public currentUserSubject: BehaviorSubject<User>;
  public currentUser: Observable<User>;

  constructor(private http: HttpClient, public imagePicker: ImagePicker, private cameraPreview: CameraPreview) {
    const user = JSON.parse(localStorage.getItem('currentUser'));
    this.currentUserSubject = new BehaviorSubject<User>(new User(user ? user : {}));
    this.currentUser = this.currentUserSubject.asObservable();
  }

  public get currentUserValue(): User {
    return this.currentUserSubject.value;
  }

  login(username, password) {
    return this.http.post<any>(`${config.apiUrl}/users/authenticate`, {username, password})
      .pipe(map(user => {
        // store user details and jwt token in local storage to keep user logged in between page refreshes
        localStorage.setItem('currentUser', JSON.stringify(user));
        this.currentUserSubject.next(new User(user));
        return user;
      }));
  }


  changePassword(id, oldpassword, newpassword) {
    const subscriberFunc = (observer) => {
      return this.http.post<any>(`${config.apiUrl}/users/changepassword`, {id, oldpassword, newpassword})
        .subscribe((data) => {
          observer.next(data);
        }, (errors) => {
          observer.error(errors);
        }, () => {
          observer.complete();
        });
    };
    return new Observable(subscriberFunc);
  }

  updateUser(user: User) {
    const subscriberFunc = (observer) => {
      const tempuser = new UserModel(user);
      tempuser.removeKeys(['kiosks', 'roles', 'wilayat', 'pollingStation', 'selected']);
      return this.http.put<any>(`${config.apiUrl}/users/` + tempuser.id, {...tempuser})
        .subscribe(() => {
          return this.http.get<any>(`${config.apiUrl}/users/` + tempuser.id).subscribe((userresponse) => {
            userresponse.token = user.token;
            // store user details and jwt token in local storage to keep user logged in between page refreshes
            localStorage.setItem('currentUser', JSON.stringify(userresponse));
            this.currentUserSubject.next(new User(userresponse));
            observer.next();
            observer.complete();
            return userresponse;
          });
        }, (errors) => {
          console.log(errors);
          observer.error(errors);
        }, () => {
          console.log('completed');
        });
    };
    return new Observable(subscriberFunc);
  }

  uploadImage(formdata, cb) {
    return this.http.post<any>(`${config.apiUrl}/users/UploadFiles`, formdata)
      .subscribe((success) => {
        cb(success);
      }, (errors) => {
        cb(errors);
      }, () => {
        console.log('completed');
      });
  }

  converttoBlob(imagebase64data, cb) {
    const base64ToBlob = (b64Data, contentType = '', sliceSize = 1024) => {
      const byteCharacters = atob(b64Data);
      const byteArrays = [];

      for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
        const slice = byteCharacters.slice(offset, offset + sliceSize);

        const byteNumbers = new Array(slice.length);
        for (let i = 0; i < slice.length; i++) {
          byteNumbers[i] = slice.charCodeAt(i);
        }

        const byteArray = new Uint8Array(byteNumbers);
        byteArrays.push(byteArray);
      }
      return new Blob(byteArrays, {type: contentType});
    };
    cb(base64ToBlob(imagebase64data, 'image/png'), imagebase64data);
  }

  getImageFromPicker(cb) {
    const getPictures = () => {
      const options = {
        // Android only. Max images to be selected, defaults to 15. If this is set to 1, upon
        // selection of a single image, the plugin will return it.
        maximumImagesCount: 1,

        // max width and height to allow the images to be.  Will keep aspect
        // ratio no matter what.  So if both are 800, the returned image
        // will be at most 800 pixels wide and 800 pixels tall.  If the width is
        // 800 and height 0 the image will be 800 pixels wide if the source
        // is at least that wide.
        width: 256,
        height: 256,

        // quality of resized image, defaults to 100
        quality: 100,

        // output type, defaults to FILE_URIs.
        // available options are
        // window.imagePicker.OutputType.FILE_URI (0) or
        // window.imagePicker.OutputType.BASE64_STRING (1)
        outputType: 1
      };
      this.imagePicker.getPictures(options).then((results) => {
        this.converttoBlob(results[0], cb);
      }, (err) => {
      });
    };
    const haspermission = this.imagePicker.hasReadPermission().then((success) => {
      getPictures();
    }, (errors) => {
      const temp = this.imagePicker.requestReadPermission();
      temp.then((success) => {
        getPictures();
      }, (error) => {
        alert('Needed permissions to upload images');
      });
    });
  }

  // openCamera(cb) {
  //   const options: CameraOptions = {
  //     quality: 100,
  //     destinationType: this.camera.DestinationType.FILE_URI,
  //     encodingType: this.camera.EncodingType.PNG,
  //     saveToPhotoAlbum: true,
  //     mediaType: this.camera.MediaType.PICTURE
  //   };
  //
  //   this.camera.getPicture(options).then((imageData) => {
  //     // imageData is either a base64 encoded string or a file URI
  //     // If it's base64 (DATA_URL):
  //     // let base64Image = 'data:image/jpeg;base64,' + imageData;
  //     this.converttoBlob(imageData, cb);
  //   }, (err) => {
  //     // Handle error
  //   });
  // }

  openCameraPreview() {
    let picture: any;
    // camera options (Size and location). In the following example, the preview uses the rear camera and display the preview in the back of the webview
    const cameraPreviewOpts: CameraPreviewOptions = {
      x: 0,
      y: 0,
      width: window.screen.width,
      height: window.screen.height,
      camera: 'rear',
      tapPhoto: true,
      previewDrag: true,
      toBack: true,
      alpha: 1
    };

    // start camera
    this.cameraPreview.startCamera(cameraPreviewOpts).then(
      (res) => {
        console.log(res);
      },
      (err) => {
        console.log(err);
      });

    // Set the handler to run every time we take a picture
    // this.cameraPreview.setOnPictureTakenHandler().subscribe((result) => {
    //   console.log(result);
    //   // do something with the result
    // });


    // // take a snap shot
    // this.cameraPreview.takeSnapshot(pictureOpts).then((imageData) => {
    //   picture = 'data:image/jpeg;base64,' + imageData;
    // }, (err) => {
    //   console.log(err);
    //   picture = 'assets/img/test.jpg';
    // });
  }

  captureImage(cb) {
    // picture options
    const pictureOpts: CameraPreviewPictureOptions = {
      width: window.screen.width,
      height: window.screen.height,
      quality: 85
    };

    // take a picture
    this.cameraPreview.takePicture(pictureOpts).then((imageData) => {
      this.converttoBlob(imageData, cb);
    }, (err) => {
      console.log(err);
      // TODO Error handling
    });

  }

  switchFlash(state) {
    if (state) {
      this.cameraPreview.getSupportedFlashModes().then((success) => {
        success.length === 0 ? alert('Flash not supported') : true;
        for (const i in success) {
          if (i === 'torch') {
            this.cameraPreview.setFlashMode(this.cameraPreview.FLASH_MODE.TORCH);
            break;
          } else if (i === 'on') {
            this.cameraPreview.setFlashMode(this.cameraPreview.FLASH_MODE.ON);
            break;
          }
        }
      });
    } else {
      this.cameraPreview.setFlashMode(this.cameraPreview.FLASH_MODE.OFF);
    }
  }

  // Switch camera
  switchCamera() {
    this.cameraPreview.switchCamera();
  }

  stopCamera() {
    // Stop the camera preview
    this.cameraPreview.stopCamera();
  }

  logout() {
    // remove user from local storage and set current user to null
    localStorage.removeItem('currentUser');
    this.currentUserSubject.next(null);
  }
}


@Injectable({providedIn: 'root'})
export class KiosksStatusService {
  public currentDataServiceSubject: BehaviorSubject<KiosksStatusModel>;
  public currentDataService: Observable<KiosksStatusModel>;

  constructor(private http: HttpClient, private apiService: APIService) {
    this.currentDataServiceSubject = new BehaviorSubject<KiosksStatusModel>(new KiosksStatusModel());
    this.currentDataService = this.currentDataServiceSubject.asObservable();
  }

  public get currentDataServiceSubjectValue(): KiosksStatusModel {
    return this.currentDataServiceSubject.value;
  }

  getKiosksStatusByWilayatId(id: string, pollingstation, type: string, assigned: string) {
    const subscriberFunc = (observer) => {
      this.apiService.getKiosksAssignedStatusByWilayatId(id).subscribe((success) => {
        this.currentDataServiceSubject.value.addAssignedKiosks(success, pollingstation, type, assigned);
        this.currentDataServiceSubject.next(this.currentDataServiceSubject.value);
        observer.next(success);
      }, (errors) => {
        observer.error(errors);
      }, () => {
        return observer.complete();
      });
    };
    return new Observable(subscriberFunc);
  }

  getKiosksStatusAll(pollingstation, type: string, assigned: string) {
    const subscriberFunc = (observer) => {
      this.apiService.getKiosksStatusAll().subscribe((success) => {
        this.currentDataServiceSubject.value.addAssignedKiosks(success, pollingstation, type, assigned);
        this.currentDataServiceSubject.next(this.currentDataServiceSubject.value);
        observer.next(success);
      }, (errors) => {
        observer.error(errors);
      }, () => {
        return observer.complete();
      });
    };
    return new Observable(subscriberFunc);
  }

  getKiosksStatusByGovernorateId(id: string, pollingstation, type: string, assigned: string) {
    const subscriberFunc = (observer) => {
      this.apiService.getKiosksStatusByGovernorateId(id).subscribe((success) => {
        this.currentDataServiceSubject.value.addAssignedKiosks(success, pollingstation, type, assigned);
        this.currentDataServiceSubject.next(this.currentDataServiceSubject.value);
        observer.next(success);
      }, (errors) => {
        observer.error(errors);
      }, () => {
        return observer.complete();
      });
    };
    return new Observable(subscriberFunc);
  }

  updatePollingStationKeys(pollingstations: Array<PollingStation>) {
    this.currentDataServiceSubject.value.updatePollingStationKeys(pollingstations);
    this.currentDataServiceSubject.next(this.currentDataServiceSubject.value);
  }

  setDataToRedirect(pollingStation: PollingStation, kiosksAssigned: any, user: User) {
    this.currentDataServiceSubject.value.setDataToRedirect(pollingStation, kiosksAssigned, user);
    this.currentDataServiceSubject.next(this.currentDataServiceSubject.value);
  }

  updateKiosksToUser(id, assignedById, assignedToId, kiosksId, PollingStationID) {
    const subscriberFunc = (observer) => {
      if (id) {
        return this.http.put<any>(`${config.apiUrl}/kiosksassignment/` + id, {
          MemberId: assignedToId,
          AssignedBy: assignedById,
          KioskId: kiosksId,
          PollingStationID,
          isDeleted: false
        })
          .subscribe(success => {
            // store user details and jwt token in local storage to keep user logged in between page refreshes
            observer.next(success);
            return observer.complete();
          }, errors => {
            observer.error(errors);
          });
      } else {
        return this.http.post<any>(`${config.apiUrl}/kiosksassignment/assignUserToKiosks`, {
          MemberId: assignedToId,
          AssignedBy: assignedById,
          KioskId: kiosksId,
          PollingStationID,
          isDeleted: false
        })
          .subscribe(success => {
            // store user details and jwt token in local storage to keep user logged in between page refreshes
            observer.next(success);
            return observer.complete();
          }, errors => {
            observer.error(errors);
          });
      }
    };
    return new Observable(subscriberFunc);
  }

}

@Injectable({providedIn: 'root'})
export class AttendanceStatusService {
  public currentDataServiceSubject: BehaviorSubject<AttendanceStatusModel>;
  public currentDataService: Observable<AttendanceStatusModel>;

  constructor(private http: HttpClient, private apiService: APIService) {
    this.currentDataServiceSubject = new BehaviorSubject<AttendanceStatusModel>(new AttendanceStatusModel({}));
    this.currentDataService = this.currentDataServiceSubject.asObservable();
  }

  public get currentDataServiceSubjectValue(): AttendanceStatusModel {
    return this.currentDataServiceSubject.value;
  }

  setDataToRedirect(pollingStation: PollingStation, kiosksAssigned: any, user: User) {
    this.currentDataServiceSubject.value.setDataToRedirect(pollingStation, kiosksAssigned, user);
    this.currentDataServiceSubject.next(this.currentDataServiceSubject.value);

  }

  getAttendanceStatusByWilayatId(id: string, pollingstation, type: string, assigned: string) {
    const subscriberFunc = (observer) => {
      this.apiService.getAttendanceStatusByWilayatId(id).subscribe((success) => {
        this.currentDataServiceSubject.value.addUsersStatus(success, pollingstation, type, assigned);
        this.currentDataServiceSubject.next(this.currentDataServiceSubject.value);
        observer.next(success);
      }, (errors) => {
        observer.error(errors);
      }, () => {
        return observer.complete();
      });
    };
    return new Observable(subscriberFunc);
  }

  getAttendanceStatusAll(pollingstation, type: string, assigned: string) {
    const subscriberFunc = (observer) => {
      this.apiService.getAttendanceStatusAll().subscribe((success) => {
        this.currentDataServiceSubject.value.addUsersStatus(success, pollingstation, type, assigned);
        this.currentDataServiceSubject.next(this.currentDataServiceSubject.value);
        observer.next(success);
      }, (errors) => {
        observer.error(errors);
      }, () => {
        return observer.complete();
      });
    };
    return new Observable(subscriberFunc);
  }

  getAttendanceStatusByGovernorateId(id: string, pollingstation, type: string, assigned: string) {
    const subscriberFunc = (observer) => {
      this.apiService.getAttendanceStatusByGovernorateId(id).subscribe((success) => {
        this.currentDataServiceSubject.value.addUsersStatus(success, pollingstation, type, assigned);
        this.currentDataServiceSubject.next(this.currentDataServiceSubject.value);
        observer.next(success);
      }, (errors) => {
        observer.error(errors);
      }, () => {
        return observer.complete();
      });
    };
    return new Observable(subscriberFunc);
  }

  updatePollingStationKeys(pollingstations: Array<PollingStation>) {
    this.currentDataServiceSubject.value.updatePollingStationKeys(pollingstations);
    this.currentDataServiceSubject.next(this.currentDataServiceSubject.value);
  }

  // getKiosksLockedStats(id: string) {
  //   this.apiService.getKiosksLockedStats(id).subscribe((success) => {
  //     this.currentDataServiceSubject.value.addKiosksStatus(success);
  //     this.currentDataServiceSubject.next(this.currentDataServiceSubject.value);
  //   }, (errors) => {
  //     console.log(errors);
  //   }, () => {
  //     console.log('completed');
  //   });
  // }
}

@Injectable({providedIn: 'root'})
export class WitnessStatusService {
  public currentDataServiceSubject: BehaviorSubject<WitnessStatusModel>;
  public currentDataService: Observable<WitnessStatusModel>;

  constructor(private http: HttpClient, private apiService: APIService) {
    this.currentDataServiceSubject = new BehaviorSubject<WitnessStatusModel>(new WitnessStatusModel({}));
    this.currentDataService = this.currentDataServiceSubject.asObservable();
  }

  public get currentDataServiceSubjectValue(): WitnessStatusModel {
    return this.currentDataServiceSubject.value;
  }

  getWitnessStatusByWilayatId(id: string, type: string) {
    if (type === 'voting' || type === 'counting' || type === 'organizing') {
      this.apiService.getWitnessStatusByWilayatId(id).subscribe((success) => {
        this.currentDataServiceSubject.value.updateWitnessData(success);
        this.currentDataServiceSubject.next(this.currentDataServiceSubject.value);
      }, (errors) => {
        console.log(errors);
      }, () => {
        console.log('completed');
      });
    }
  }

  getWitnessStatusAll(type: string) {
    if (type === 'voting' || type === 'counting' || type === 'organizing') {
      this.apiService.getWitnessStatusAll().subscribe((success) => {
        this.currentDataServiceSubject.value.updateWitnessData(success);
        this.currentDataServiceSubject.next(this.currentDataServiceSubject.value);
      }, (errors) => {
        console.log(errors);
      }, () => {
        console.log('completed');
      });
    }
  }

  getWitnessStatusByGovernorateId(id: string, type: string) {
    if (type === 'voting' || type === 'counting' || type === 'organizing') {
      this.apiService.getWitnessStatusByGovernorateId(id).subscribe((success) => {
        this.currentDataServiceSubject.value.updateWitnessData(success);
        this.currentDataServiceSubject.next(this.currentDataServiceSubject.value);
      }, (errors) => {
        console.log(errors);
      }, () => {
        console.log('completed');
      });
    }
  }

//   public int Id { get; set; }
// public string ImageUrl { get; set; }
// public int? UploadedBy { get; set; }
// public string UploadedTime { get; set; }
// public string WilayatCode { get; set; }
// public int PollingStationID { get; set; }
  updateWitnessId(url: string, user: User, pollingStation: PollingStation) {
    // alert(pollingStation.id);
    this.apiService.postWitnessId({
      ImageUrl: url,
      UploadedBy: user.id,
      UploadedTime: new Date().toISOString(),
      WilayatCode: user.wilayatCode,
      PollingStationID: pollingStation.id
    }).subscribe((witnessadded) => {
      this.apiService.getWitnessStatusByWilayatId(user.wilayatCode).subscribe((success) => {
        this.currentDataServiceSubject.value.updateWitnessData(success);
        this.currentDataServiceSubject.next(this.currentDataServiceSubject.value);
      }, (errors) => {
        console.log(errors);
      }, () => {
        console.log('completed');
      });
    }, (errors) => {
      console.log(errors);
    }, () => {
      console.log('completed');
    });
  }
}

@Injectable({providedIn: 'root'})
export class AssignKiosksService {
  public currentDataServiceSubject: BehaviorSubject<AssignKiosksModel>;
  public currentDataService: Observable<AssignKiosksModel>;

  constructor(private http: HttpClient, private apiService: APIService) {
    this.currentDataServiceSubject = new BehaviorSubject<AssignKiosksModel>(new AssignKiosksModel({}));
    this.currentDataService = this.currentDataServiceSubject.asObservable();
  }

  public get currentDataServiceSubjectValue(): AssignKiosksModel {
    return this.currentDataServiceSubject.value;
  }

  getUsersAssignedToPollingStation(kiosks) {
    const subscriberFunc = (observer) => {
      if (kiosks && kiosks.kiosks) {
        this.apiService.getKiosksAssignedStatusByPollingStationId(kiosks.kiosks.pollingStationID).subscribe((success) => {
          this.currentDataServiceSubject.value.addUsersAssigned(success);
          this.currentDataServiceSubject.next(this.currentDataServiceSubject.value);
          observer.next(this.currentDataServiceSubject.value);
        }, (errors) => {
          observer.error(errors);
        }, () => {
          return observer.complete();
        });
      }
    };
    return new Observable(subscriberFunc);
  }

  getKiosksById(scandata) {
    const subscriberFunc = (observer) => {
      // broswer on qr scan returns .result while in android its string process accordingly
      const dataQRProcesser = (data) => {
        // alert(JSON.stringify(data) + typeof data);
        if (typeof data === 'string') {
          return data;
        } else if (data && data.result) {
          return data.result;
        }
      };
      this.apiService.getKioskById(dataQRProcesser(scandata)).subscribe((success) => {
        // alert(JSON.stringify(success));
        if (success) {
          this.currentDataServiceSubject.value.addKiosks(success);
        }
        this.currentDataServiceSubject.next(this.currentDataServiceSubject.value);
        observer.next(this.currentDataServiceSubject.value);
      }, (errors) => {
        observer.error(errors);
      }, () => {
        return observer.complete();
      });
    };
    return new Observable(subscriberFunc);
  }

  assignKiosksToUser(assignedBy, assignedTo, kiosks, PollingStationID) {
    const subscriberFunc = (observer) => {
      this.apiService.assignKiosksToUser(assignedBy, assignedTo, kiosks, PollingStationID).subscribe((success) => {
        observer.next(success);
      }, (errors) => {
        observer.error(errors);
      }, () => {
        return observer.complete();
      });
    };
    return new Observable(subscriberFunc);
  }

  updateKiosksToUser(id, assignedBy, assignedTo, kiosks, PollingStationID) {
    const subscriberFunc = (observer) => {
      this.apiService.updateKiosksToUser(id, assignedBy, assignedTo, kiosks, PollingStationID).subscribe((success) => {
        observer.next(success);
      }, (errors) => {
        observer.error(errors);
      }, () => {
        return observer.complete();
      });
    };
    return new Observable(subscriberFunc);
  }
}


