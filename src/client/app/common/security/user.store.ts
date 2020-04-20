import { Injectable } from '@angular/core';
import { environment } from '@environments/environment';
import { CookiesService } from '@ngx-utils/cookies';
import { User } from '@shared/interface/user.int';

@Injectable()
export class UserStore {

  private user: User;

  constructor(private cookies: CookiesService) {
  }

  getUser() {
    return this.user;
  }

  setUser(user: any) {
    this.user = user;
  }

  getToken() {
    return this.cookies.get(environment.AUTH_TOKEN_NAME);
  }

  setToken(token: string) {
    this.cookies.put(environment.AUTH_TOKEN_NAME, token);
  }
}
