import { Injectable, NestMiddleware } from '@nestjs/common';
import { AuthService } from './auth.service';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  constructor(private readonly authService: AuthService) {}

  use(req: Request, _res: Response, next: Function) {
    this.authService.authenticate(req, next);
  }
}
