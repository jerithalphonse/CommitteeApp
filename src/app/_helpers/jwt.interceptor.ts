import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class LoaderService {

    public isLoading = new BehaviorSubject(false);
    constructor() { }
}

import {
    HttpErrorResponse,
    HttpResponse,
    HttpRequest,
    HttpHandler,
    HttpEvent,
    HttpInterceptor
} from '@angular/common/http';
import { Observable } from 'rxjs';
import {AuthenticationService} from '../_services/authentication.service';
import {LoadingController} from '@ionic/angular';
@Injectable()
export class JwtInterceptor implements HttpInterceptor {
    private requests: HttpRequest<any>[] = [];

    constructor(private loadingCtrl: LoadingController, public authenticationService: AuthenticationService) { }

    removeRequest(req: HttpRequest<any>, loaderres: any) {
        const i = this.requests.indexOf(req);
        if (i >= 0) {
            this.requests.splice(i, 1);
        }
        loaderres.dismiss();
        // this.loaderService.isLoading.next(this.requests.length > 0);
    }

    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        const currentUser = this.authenticationService.currentUserValue;
        if (currentUser && currentUser.token) {
            let temp = {
                setHeaders: {
                    'Access-Control-Allow-Origin' : '*',
                    'Access-Control-Allow-Methods' : 'POST, GET, OPTIONS, PUT, DELETE',
                    Accept : 'application/json',
                    Authorization: `Bearer ${currentUser.token}`
                }
            }
            if (req.url.indexOf('/users/UploadFiles') !== -1) {
                req = req.clone(temp);
            } else {
               temp.setHeaders['content-type'] =  'application/json';
               req = req.clone(temp);
            }
        }
        // this.loaderService.isLoading.next(true);
        return Observable.create(observer => {
            const loader = this.loadingCtrl.create({
                message: 'جار التحميل'
            }).then((loaderres) => {
                loaderres.present();
                const subscription = next.handle(req)
                  .subscribe(
                    event => {
                        if (event instanceof HttpResponse) {
                            this.removeRequest(req, loaderres);
                            observer.next(event);
                        }
                    },
                    err => {
                        alert('Failed to process, Please try again after sometime' + err);
                        this.removeRequest(req, loaderres);
                        observer.error(err);
                    },
                    () => {
                        this.removeRequest(req, loaderres);
                        observer.complete();
                    });
                // remove request from queue when cancelled
                return () => {
                    this.removeRequest(req, loaderres);
                    subscription.unsubscribe();
                };
            });
        });
    }
}

