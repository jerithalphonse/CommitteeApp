import {Injectable} from '@angular/core';
import {Events} from '@ionic/angular';
import 'rxjs/operators/map';
import {HttpClient} from '@angular/common/http';
import {BehaviorSubject, Observable} from 'rxjs';
import {map} from 'rxjs/operators';
import {config, PollingStation, User, Wilayat} from '../../_models';
import {APIService, WitnessStatusModel} from '../../_services/authentication.service';

export class ChatMessage {
  public Id: string;
  public ToId: string;
  public By: string;
  public CreatedAt: string;
  public Message: string;
  public To: string;
  public WilayatCode: string;
  public Wilayat: Wilayat;
  public CreatedBy: User;
  public CreatedToUser: User;

  constructor(props) {
    this.Id = props.id ? props.id : null;
    this.By = props.by ? props.by : null;
    this.CreatedAt = props.createdAt ? props.createdAt : '';
    this.Message = props.message ? props.message : '';
    this.To = props.to ? props.to : '';
    this.ToId = props.toId ? props.toId : null;
    this.WilayatCode = props.wilayatCode ? props.wilayatCode : null;
    this.Wilayat = props.wilayat ? new Wilayat(props.wilayat) : new Wilayat({});
    this.CreatedBy = props.createdBy ? new User(props.createdBy) : new User({});
    this.CreatedToUser = props.createdToUser ? new User(props.createdToUser) : new User( {});
  }
}

export class RestrictWaliTime {
  public startDateTime: Date;
  public endDateTime: Date;
  constructor(props) {
    this.startDateTime = props.startDateTime ? new Date(this.startDateTime) : null;
    this.endDateTime = props.endDateTime ? new Date(this.endDateTime) : null;
  }
}

export class ChatList {
  public allmessages: Array<ChatMessage> = [];
  public chatrole: string;
  public restrictwali: Array<RestrictWaliTime> = [];

  constructor(props) {
    this.initMessage(props, new User({}));
  }

  public initMessage(data, user: User) {
    const viewtypes = {
      high_committee: {
        readonly: ['high_committee', 'main_committee', 'wilayat_officer', 'wilayat_officer_only' ],
        toallmembers: ['high_committee', 'main_committee', 'wilayat_officer', 'wilayat_assistant'],
        towaliofficers: ['high_committee', 'main_committee', 'wilayat_officer', 'wilayat_assistant', 'wilayat_officer_only', 'high_committee_only'],
        tocommitteehead: ['high_committee', 'main_committee', 'committee_head_only', 'high_committee_only'],
      }, main_committee: {
        readonly: ['high_committee', 'main_committee', 'wilayat_officer', 'wilayat_assistant', 'wilayat_officer_only', 'committee_head_only', 'high_committee_only'],
        toallmembers: ['high_committee', 'main_committee', 'wilayat_officer', 'wilayat_assistant'],
        towaliofficers: ['high_committee', 'main_committee', 'wilayat_officer', 'wilayat_assistant', 'wilayat_officer_only', 'high_committee_only'],
        tocommitteehead: ['high_committee', 'main_committee', 'committee_head_only', 'high_committee_only'],
      }, wali_officer: {
        readonly: ['high_committee', 'main_committee', 'wilayat_officer', 'wilayat_assistant', 'wilayat_officer_only'],
        toallmembers: ['high_committee', 'main_committee', 'wilayat_officer', 'wilayat_assistant', 'committee_head'],
        toheadcommittee: ['high_committee', 'main_committee', 'high_committee_only', 'wilayat_officer_only'],
      }, wali_assistant: {
        readonly: ['high_committee', 'main_committee', 'wilayat_officer', 'wilayat_assistant', 'wilayat_officer_only'],
        toallmembers: ['high_committee', 'main_committee', 'wilayat_officer', 'wilayat_assistant', 'committee_head'],
        toheadcommittee: ['high_committee', 'main_committee', 'wilayat_officer_only', 'high_committee_only'],
      }, committee_head_voting: {
        readonly: ['high_committee', 'main_committee', 'wilayat_officer', 'wilayat_assistant', 'committee_head', 'committee_head_only'],
        toallmembers: ['committee_head']
      }, committee_head_counting: {
        readonly: ['high_committee', 'main_committee', 'wilayat_officer', 'wilayat_assistant', 'committee_head', 'committee_head_only'],
        toallmembers: ['committee_head']
      }, polling_station_supervisor_voting: {
        readonly: ['high_committee', 'main_committee', 'wilayat_officer', 'wilayat_assistant', 'committee_head']
      }, polling_station_supervisor_counting: {
        readonly: ['high_committee', 'main_committee', 'wilayat_officer', 'wilayat_assistant', 'committee_head']
      }, committee_member_voting: {
        readonly: ['high_committee', 'main_committee', 'wilayat_officer', 'wilayat_assistant', 'committee_head']
      }, committee_member_counting: {
        readonly: ['high_committee', 'main_committee', 'wilayat_officer', 'wilayat_assistant', 'committee_head']
      }, committee_head_organizing: {
        readonly: ['high_committee', 'main_committee', 'wilayat_officer', 'wilayat_assistant', 'committee_head', 'committee_head_only'],
        toallmembers: ['committee_head']
      }, polling_station_supervisor_organizing: {
        readonly: ['high_committee', 'main_committee', 'wilayat_officer', 'wilayat_assistant', 'committee_head']
      }, committee_member_organizing: {
        readonly: ['high_committee', 'main_committee', 'wilayat_officer', 'wilayat_assistant', 'committee_head']
      }
    };
    const messageDecider = (message) => {
      // first level filter to show the message or not;
      const getMessage = (list, rolename) => {
        for (const i in list) {
          if (list && list[i] === message.To) {
            if (message.CreatedBy && message.CreatedBy.roles && message.CreatedBy.roles.id <= 3) {
              return message;
            } else {
              if ((rolename === 'committee_head_voting' || rolename === 'polling_station_supervisor_voting' || rolename === 'committee_member_voting')) {
                return message.CreatedBy.roles.name === 'committee_head_voting' ? message : false;
              } else if ((rolename === 'committee_head_counting' || rolename === 'polling_station_supervisor_counting' || rolename === 'committee_member_counting')) {
                return message.CreatedBy.roles.name === 'committee_head_counting' ? message : false;
              } else if ((rolename === 'committee_head_organizing' || rolename === 'polling_station_supervisor_organizing' || rolename === 'committee_member_organizing')) {
                return message.CreatedBy.roles.name === 'committee_head_organizing' ? message : false;
              } else {
                return message;
              }
            }
          }
        }
        return false;
      };
      if (user && user.roles && user.roles.name) {
        const temp = viewtypes[user.roles.name];
        if (temp && this.chatrole === 'toallmembers') {
          return getMessage(temp[this.chatrole], user.roles.name);
        } else if (temp && this.chatrole === 'towaliofficers') {
          return getMessage(temp[this.chatrole], user.roles.name);
        } else if (temp && this.chatrole === 'toheadcommittee') {
          return getMessage(temp[this.chatrole], user.roles.name);
        } else if (temp && this.chatrole === 'tocommitteehead') {
          return getMessage(temp[this.chatrole], user.roles.name);
        } else if (temp && this.chatrole === 'readonly') {
          return getMessage(temp[this.chatrole], user.roles.name);
        }
        return false;
      }
    };
    const personalMessageDecider = (message) => {
      // check if we have a message only to a specific person (say high committee sending it only to wali)
      if (message && message.ToId && message.ToId) {
        if (message.ToId === user.id) {
          return message;
        } else if (message.By === user.id) {
          return message;
        } else {
          return false;
        }
      } else {
        return message;
      }
    };
    this.allmessages = [];
    for (const i in data) {
      let temp = new ChatMessage(data[i]);
      temp = messageDecider(temp);
      temp = personalMessageDecider(temp);
      if (data[i] && temp) {
        this.allmessages.push(temp);
      }
    }
  }

  setChatRole(chatrole: string) {
    this.chatrole = chatrole;
  }
}

@Injectable({providedIn: 'root'})
export class ChatService {
  public currentDataServiceSubject: BehaviorSubject<ChatList>;
  public currentDataService: Observable<ChatList>;

  constructor(private http: HttpClient, private apiService: APIService) {
    const restrictwali = JSON.parse(localStorage.getItem('restrictwali'));
    this.currentDataServiceSubject = new BehaviorSubject<ChatList>(new ChatList({}));
    this.currentDataService = this.currentDataServiceSubject.asObservable();
  }

  public get currentDataServiceSubjectValue(): ChatList {
    return this.currentDataServiceSubject.value;
  }

  sendMsg(msg: string, user: User, type: any, toUser: User) {
    const mapperTo = (role, message_type) => {
      if (message_type) {
        return message_type;
      } else {
        if (role && role.id === 1) {
          return 'high_committee';
        } else if (role && role.id === 2002) {
          return 'main_committee';
        } else if (role && role.id === 2) {
          return 'wilayat_officer';
        } else if (role && role.id === 3) {
          return 'wilayat_officer';
        } else if (role && role.id === 4) {
          return 'committee_head_voting';
        } else if (role && role.id === 1002) {
          return 'committee_head_organizing';
        } else if (role && role.id === 6) {
          return 'team_members_voting';
        } else if (role && role.id === 1003) {
          return 'team_members_organizing';
        } else if (role && role.id === 8) {
          return 'team_members_voting';
        } else if (role && role.id === 9) {
          return 'team_members_organizing';
        } else if (role && role.id === 5) {
          return 'committee_head_counting';
        } else if (role && role.id === 7) {
          return 'team_members_counting';
        } else if (role && role.id === 1004) {
          return 'team_members_organizing';
        }
      }
    };
    const mapperToEveryWilayat = (role, userdata, message_type, toUser) => {
      if (message_type === 'wilayat_officer_only'  || message_type === 'high_committee_only') {
        // if (toUser && toUser.id) {
        //   // if we specify the user it should go only to that specific user
        //   return toUser.wilayatCode;
        // } else {
          // generic message to all wilayats
          return null;
        // }
      } else {
        if (role && (role.id === 1 || role.id === 2002)) {
          // generic message to all wilayats by high committee and main_committee
          return null;
        } else {
          return  userdata.wilayatCode;
        }
      }
    };
    const subscriberFunc = (observer) => {
      let temp = new ChatMessage({
        by: user.id,
        createdAt: new Date(),
        message: msg,
        wilayatCode: mapperToEveryWilayat(user.roles, user, type, toUser) ,
        toId: toUser.id,
        to: mapperTo(user.roles, type)
      });
      delete temp.Id;
      delete temp.CreatedBy;
      delete temp.Wilayat;
      delete temp.CreatedToUser;
      this.http.post(`${config.apiUrl}/messaging/wilayat`, temp).subscribe(messages => {
        // store user details and jwt token in local storage to keep user logged in between page refreshes
        observer.next(messages);
        return observer.complete();
      }, errors => {
        observer.error(errors);
      });
    };
    return new Observable(subscriberFunc);
  }

  getMessagesByWilyatId(code: string, user) {
    const subscriberFunc = (observer) => {
      this.http.get(`${config.apiUrl}/messaging/wilayat/` + code)
        .subscribe(messages => {
          // store user details and jwt token in local storage to keep user logged in between page refreshes
          this.currentDataServiceSubject.value.initMessage(messages, user);
          this.currentDataServiceSubject.next(this.currentDataServiceSubject.value);
          observer.next(messages);
          return observer.complete();
        }, errors => {
          observer.error(errors);
        });
    };
    return new Observable(subscriberFunc);
  }

  setChatRole(chatrole: string) {
    const subscriberFunc = (observer) => {
      this.currentDataServiceSubject.value.setChatRole(chatrole);
      this.currentDataServiceSubject.next(this.currentDataServiceSubject.value);
      observer.next();
      return observer.complete();
    };
    return new Observable(subscriberFunc);
  }
}

