import { Observable } from 'rxjs';
import { HttpRequest, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { UserStore } from '../security/user.store';
import { AsiLocalStorageService, AsiRefreshTokenInceptor } from '@asi-ngtools/lib';
import { AuthRestServiceClient } from './auth/auth.restservice';
import { environment } from '@environments/environment';

@Injectable()
export class B2bioHttpInterceptor extends AsiRefreshTokenInceptor {

  constructor(private router: Router,
    private asiLocalStorage: AsiLocalStorageService,
    private authWebService: AuthRestServiceClient,
    private userStore: UserStore) {
    super();
  }

  addAuthenticationToken(req: HttpRequest<any>, replay: boolean): HttpRequest<any> {
    const headers: any = {};
    const reqHeaders: HttpHeaders = req.headers;
    const authToken = this.userStore.getToken();
    if (authToken && (replay || !reqHeaders.get(environment.AUTH_TOKEN_NAME))) {
      headers[environment.AUTH_TOKEN_NAME] = authToken;
    }
    return req.clone({
      setHeaders: headers
    });
  }

  getRefreshTokenUrl(): string {
    return 'auth/refresh';
  }

  callAndSaveRefreshToken(): Observable<any> {
    return this.authWebService.refreshToken();
  }

  getLoginUrl(): string {
    return 'auth/login';
  }

  goToLoginPage(_req: HttpRequest<any>, _err: any): void {
    this.asiLocalStorage.setItem(environment.LOGIN_SAVE_URL, window.location.href);
    this.router.navigate(['/login']);
  }
}
