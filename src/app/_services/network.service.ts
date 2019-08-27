import {Network} from '@ionic-native/network/ngx';
import {Injectable} from '@angular/core';

@Injectable({providedIn: 'root'})
export class NetworkService {
  public online = false;
  public networktype = 'wifi';
  constructor(private network: Network) {
  }
  // watch network for a disconnection
  disconnectSubscription = this.network.onDisconnect().subscribe(() => {
    console.log('network was disconnected :-(');
    this.online = false;
  });

  // watch network for a connection
  connectSubscription = this.network.onConnect().subscribe(() => {
    console.log('network connected!');
    this.online = true;
    // We just got a connection but we need to wait briefly
    // before we determine the connection type. Might need to wait.
    // prior to doing any api requests as well.
    setTimeout(() => {
      if (this.network.type === 'wifi') {
        this.networktype = this.network.type;
      } else {
        this.networktype = this.network.type;
      }
    }, 3000);
  });
}
