import { Module, MiddlewareConsumer, RequestMethod } from '@nestjs/common';
import { JwtStrategy } from './jwt.strategy';
import { APP_GUARD } from '@nestjs/core';
import { AuthGuard } from './guard/auth.guards';
import { AuthService } from './auth.service';
import { AuthMiddleware } from './auth.middleware';
import { AuthenticationService } from './authentication.service';
import { AuthenticationController } from './authentication.controller';

@Module({
  controllers: [AuthenticationController],
  imports: [],
  exports: [],
  providers: [JwtStrategy, AuthService, AuthMiddleware, AuthenticationService,
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    }],
})
export class BifrostSecurityModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AuthMiddleware).forRoutes({
      path: '*',
      method: RequestMethod.ALL,
    });
  }
}
