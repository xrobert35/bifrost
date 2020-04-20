import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import * as lodash from 'lodash';
import { Account } from '../model/account.entity';
import { Role } from '../model/role.enum';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) { }

  canActivate(context: ExecutionContext): boolean {
    const controllerRoles: Role[] = this.reflector.get<Role[]>('roles', context.getClass()) || [];
    const methodRoles: Role[] = this.reflector.get<Role[]>('roles', context.getHandler()) || [];
    const controllerPublic: boolean = this.reflector.get<boolean>('public', context.getClass()) || false;
    const methodPublic: boolean = this.reflector.get<boolean>('public', context.getHandler()) || false;

    const roles: Role[] = controllerRoles.concat(methodRoles);
    const pub = controllerPublic || methodPublic;

    if (pub) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (user) {
      if (!lodash.isEmpty(roles)) {
        return this.hasOneOfRoles(user, roles);
      }
      return true;
    }
    return false;
  }

  private hasOneOfRoles(user: Account, roles: Role[]): boolean {
    if (!user || !user.roles || user.roles.length === 0) {
      return false;
    }
    return roles.some((role) => user.roles.includes(role));
  }
}
