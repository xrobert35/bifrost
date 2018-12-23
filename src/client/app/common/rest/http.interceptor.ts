
import { throwError as observableThrowError, Observable } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor, HttpResponse } from '@angular/common/http';
import { Injectable, ErrorHandler } from '@angular/core';
import { Router } from '@angular/router';
import * as HttpStatus from 'http-status-codes';

@Injectable()
export class BifrostHttpInterceptor implements HttpInterceptor {

  constructor(private router: Router, private errorHandler: ErrorHandler) {
  }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
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
}
