import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import * as HttpStatus from 'http-status-codes';
import { UserStore } from '../../common/security/user.store';
import { share } from 'rxjs/operators';

@Injectable()
export class LoginService {

  constructor(private http: HttpClient, private userStorage: UserStore) {
  }

  async login(credential: { email: string, password: string }): Promise<boolean> {
    try {
      const token = await this.http.post('/auth/authenticate', credential, { responseType: 'text' })
        .pipe(share()).toPromise();
      this.userStorage.setToken(token);
      return true;
    } catch (err) {
      if (err.status !== HttpStatus.FORBIDDEN) {
        throw err;
      }
      return false;
    }
  }
}
