import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { Config } from '../../config/config';
import { IncomingMessage } from 'http';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: Config.get().AUTH_JWT_KEY,
      passReqToCallback: true,
    });
  }

  async validate(_req: IncomingMessage, payload: any) {
    return payload;
  }
}
