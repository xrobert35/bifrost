import { Injectable } from '@nestjs/common';

@Injectable()
export class AuthServiceMock {

  public authenticate(req, next) {
    const auth = req.headers.auth;
    if (auth) {
      req.user = JSON.parse(auth);
    }
    next();
  }
}
