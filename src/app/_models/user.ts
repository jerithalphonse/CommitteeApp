export class Role {
  public id: number;
  public kiosksTab;
  boolean;
  public name: string;
  public sudoname: string;
  public attendanceTab: boolean;
  public witnessTab: boolean;
  public messageTab: boolean;
  public assignPollingStationTab: boolean;
  public directionsTab: boolean;
  public kiosksTabReassign: boolean;
  public attendanceTabReassign: boolean;
  public scanQRTab: boolean;
  public witnessTabAddMore: boolean;
  public scanQrTabSelfAssignKiosks: boolean;
  public messageTabAllMembers: boolean;
  public messageTabHeadCommittees: boolean;
  public messageTabToHeadCommittee: boolean;
  public messageTabWaliOfficers: boolean;
  public messageTabCheckMessage: boolean;
  public messageTabRestrictMessage: boolean;
  public notificationTab: boolean;

  constructor(props) {
    this.id = props.id ? props.id : '';
    this.kiosksTab = props.kiosksTab ? props.kiosksTab : false;
    this.name = props.name ? props.name : '';
    this.sudoname = this.processSudoRoleName(props.name);
    this.attendanceTab = props.attendanceTab ? props.attendanceTab : false;
    this.witnessTab = props.witnessTab ? props.witnessTab : false;
    this.messageTab = props.messageTab ? props.messageTab : false;
    this.assignPollingStationTab = props.assignPollingStationTab ? props.assignPollingStationTab : false;
    this.directionsTab = props.directionsTab ? props.directionsTab : false;
    this.kiosksTabReassign = props.kiosksTabReassign ? props.kiosksTabReassign : false;
    this.attendanceTabReassign = props.attendanceTabReassign ? props.attendanceTabReassign : false;
    this.scanQRTab = props.scanQRTab ? props.scanQRTab : false;
    this.witnessTabAddMore = props.witnessTabAddMore ? props.witnessTabAddMore : false;
    this.scanQrTabSelfAssignKiosks = props.scanQrTabSelfAssignKiosks ? props.scanQrTabSelfAssignKiosks : false;
    this.messageTabAllMembers = props.messageTabAllMembers ? props.messageTabAllMembers : false;
    this.messageTabHeadCommittees = props.messageTabHeadCommittees ? props.messageTabHeadCommittees : false;
    this.messageTabToHeadCommittee = props.messageTabToHeadCommittee ? props.messageTabToHeadCommittee : false;
    this.messageTabWaliOfficers = props.messageTabWaliOfficers ? props.messageTabWaliOfficers : false;
    this.messageTabCheckMessage = props.messageTabCheckMessage ? props.messageTabCheckMessage : false;
    this.messageTabRestrictMessage = props.messageTabRestrictMessage ? props.messageTabRestrictMessage : false;
    this.notificationTab = props.notificationTab ? props.notificationTab : false;
  }

  processSudoRoleName(name: string) {
    const mapper = {
      head_committee: 'Head Commmittee',
      wali_officer: 'Wali Officer',
      wali_assistant: 'Wali Assistant',
      committee_head_voting: 'Committee Head'
    };
    const temp = mapper[name];
    return temp ? temp : '';
  }
}

export class User {
  id: number;
  email: string;
  username: string;
  nameEnglish: string;
  nameArabic: string;
  imageUrl: string;
  phone: string;
  pollingStationId: number;
  roleId: number;
  wilayatCode: string;
  commiteeType: string;
  attendedAt: string;
  kioskId: number;
  governorateCode: string;
  roles: Role;
  token: string;
  kiosks: Kiosks;
  governorate: Governorate;
  pollingStation: PollingStation;
  wilayat: Wilayat;

  constructor(props) {
    this.id = props.id ? props.id : '';
    this.username = props.username ? props.username : '';
    this.nameEnglish = props.nameEnglish ? props.nameEnglish : '';
    this.nameArabic = props.nameArabic ? props.nameArabic : '';
    this.imageUrl = props.imageUrl ? props.imageUrl : '';
    this.phone = props.phone ? props.phone : '';
    this.email = props.email ? props.email : '';
    this.pollingStationId = props.pollingStationId ? props.pollingStationId : '';
    this.roleId = props.roleId ? props.roleId : '';
    this.wilayatCode = props.wilayatCode ? props.wilayatCode : '';
    this.commiteeType = props.commiteeType ? props.commiteeType : '';
    this.attendedAt = props.attendedAt ? props.attendedAt : '';
    this.kioskId = props.kioskId ? props.kioskId : null;
    this.governorateCode = props.governorateCode ? props.governorateCode : '';
    this.roles = new Role(props.roles ? props.roles : {});
    this.token = props.token ? props.token : '';
    this.kiosks = props.kiosks ? new Kiosks(props.kiosks) : new Kiosks({});
    this.pollingStation = props.pollingStation ? new PollingStation(props.pollingStation) : new PollingStation({});
    this.wilayat = props.wilayat ? new Wilayat(props.wilayat) : new Wilayat({});
    this.governorate = props.governorate ? new Governorate(props.governorate) : new Governorate({});
  }

  onChange(value, key: string) {
    if (this[key]) {
      this[key] = value;
    }
  }
}

export class Governorate {
  code: string;
  name: string;
  arabicName: string;
  sortOrder: number;
  constructor(props) {
    this.code = props.code ? props.code : '';
    this.name = props.name ? props.name : '';
    this.arabicName = props.arabicName ? props.arabicName : '';
    this.sortOrder = props.sortOrder ? props.sortOrder : '';
  }
}

export class Wilayat {
  code: string;
  name: string;
  arabicName: string;
  governorateCode: string;
  sortOrder: number;
  isActive: boolean;
  governorate: Governorate;
  constructor(props) {
    this.code = props.code ? props.code : '';
    this.name = props.name ? props.name : '';
    this.arabicName = props.arabicName ? props.arabicName : '';
    this.governorateCode = props.governorateCode ? props.governorateCode : '';
    this.sortOrder = props.sortOrder ? props.sortOrder : '';
    this.isActive = props.isActive ? props.isActive : '';
    this.governorate = new Governorate(props.governorate ? props.governorate : {});
  }
}

export class PollingStation {
  public id: number;
  public name: string;
  public arabicName: string;
  public latitude: number;
  public longitude: number;
  public wilayatCode: string;
  public isActive: boolean;
  public isUnifiedPollingCenter: boolean;
  public wilayat: Wilayat;
  constructor(props) {
    this.id = props.id ? props.id : '';
    this.name = props.name ? props.name : '';
    this.arabicName = props.arabicName ? props.arabicName : '';
    this.latitude = props.latitude ? props.latitude : '';
    this.longitude = props.longitude ? props.longitude : '';
    this.wilayatCode = props.wilayatCode ? props.wilayatCode : '';
    this.isActive = props.isActive ? props.isActive : false;
    this.isUnifiedPollingCenter = props.isUnifiedPollingCenter ? props.isUnifiedPollingCenter : false;
    this.wilayat = new Wilayat(props.wilayat ? props.wilayat : {});
  }
}

export class Kiosks {
  public id: number;
  public serialNumber: string;
  public pollingDayStatus: number;
  public openTime: Date;
  public hasIssue: boolean;
  public closeTime: Date;
  public unlockCode: boolean;
  public wilayatCode: string;
  public pollingStationID: number;
  public isActive: boolean;
  public isUnifiedKiosk: boolean;
  public areVotersPresentAsWitnesses: boolean;
  public isNoFingerprintKiosk: boolean;
  public wilayat: Wilayat;
  public pollingStation: PollingStation;
  constructor(props) {
    this.id = props.id ? props.id : '';
    this.serialNumber = props.serialNumber ? props.serialNumber : '';
    this.pollingDayStatus = props.pollingDayStatus ? props.pollingDayStatus : '';
    this.openTime = props.openTime ? props.openTime : '';
    this.hasIssue = props.hasIssue ? props.hasIssue : '';
    this.closeTime = props.closeTime ? props.closeTime : '';
    this.unlockCode = props.unlockCode ? props.unlockCode : '';
    this.wilayatCode = props.wilayatCode ? props.wilayatCode : '';
    this.pollingStationID = props.pollingStationID ? props.pollingStationID : '';
    this.isActive = props.isActive ? props.isActive : '';
    this.isUnifiedKiosk = props.isUnifiedKiosk ? props.isUnifiedKiosk : '';
    this.areVotersPresentAsWitnesses = props.areVotersPresentAsWitnesses ? props.areVotersPresentAsWitnesses : '';
    this.isNoFingerprintKiosk = props.isNoFingerprintKiosk ? props.isNoFingerprintKiosk : '';
    this.wilayat = new Wilayat(props.wilayat ? props.wilayat : {});
    this.pollingStation = new PollingStation(props.pollingStation ? props.pollingStation : {});
  }
}

export class KiosksAssign {
  public id: number;
  public memberId: number;
  public assignedBy: number;
  public kioskId: number;
  public PollingStationID: number;
  public AttendanceStartedAt: string;
  public AttendanceCompletedAt: string;
  public isDeleted: boolean;
  public member: User;
  public assignedbymember: User;
  public Kiosks: Kiosks;
  public PollingStation: PollingStation;
  constructor(props) {
    this.id = props.id ? props.id : '';
    this.memberId = props.memberId ? props.memberId : null;
    this.assignedBy = props.assignedBy ? props.assignedBy : null;
    this.kioskId = props.kioskId ? props.kioskId : '';
    this.PollingStationID = props.pollingStationID ? props.pollingStationID : '';
    this.AttendanceStartedAt = props.attendanceStartedAt ? props.attendanceStartedAt : '';
    this.AttendanceCompletedAt = props.attendanceCompletedAt ? props.attendanceCompletedAt : '';
    this.isDeleted = props.isDeleted ? props.isDeleted : '';
    this.member = props.member ? new User(props.member) : new User({});
    this.assignedbymember = props.assignedbymember ? new User(props.assignedbymember) : new User({});
    this.Kiosks = props.kiosks ? new Kiosks(props.kiosks) : new Kiosks({});
    this.PollingStation = props.pollingStation ? new PollingStation(props.pollingStation) : new PollingStation({});
  }
}
