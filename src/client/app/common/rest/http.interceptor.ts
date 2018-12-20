
import { throwError as observableThrowError, Observable } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor, HttpResponse } from '@angular/common/http';
import { Injectable, ErrorHandler } from '@angular/core';
import { environment } from '@environments/environment';
import { UserStore } from '../store/user.store';
import { Router } from '@angular/router';
import * as HttpStatus from 'http-status-codes';

@Injectable()
export class BifrostHttpInterceptor implements HttpInterceptor {

  constructor(private router: Router, private userStore: UserStore, private errorHandler: ErrorHandler) {
  }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    req = this.addAuthentication(req);
    return next.handle(req).pipe(tap(evt => {
      if (evt instanceof HttpResponse) {
      }
    }), catchError((err) => {
      if (err.status === HttpStatus.UNAUTHORIZED) {
        this.router.navigate(['/login']);
      } else {
        this.errorHandler.handleError(err);
      }
      return observableThrowError(err);
    }));
  }

  addAuthentication(req: HttpRequest<any>): HttpRequest<any> {
    const headers: any = {};
    const authToken = this.userStore.getToken();
    if (authToken) {
      headers[environment.AUTH_TOKEN_NAME] = authToken;
      req = req.clone({
        setHeaders: headers
      });
    }
    return req;
  }
}
