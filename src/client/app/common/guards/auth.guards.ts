import { Injectable } from '@angular/core';
import { CanActivate } from '@angular/router';
import { UserStore } from '../store/user.store';
import * as lodash from 'lodash';
import { Router } from '@angular/router';

@Injectable()
export class EnsureUserAuthGuard implements CanActivate {

  constructor(private userStore: UserStore,
    private router: Router) {
  }

  canActivate() {
    if (!lodash.isEmpty(this.userStore.getToken())) {
      return true;
    } else {
      this.router.navigate(['/login']);
      return false;
    }
  }
}
