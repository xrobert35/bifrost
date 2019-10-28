import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { WinLogger } from '@common/logger/winlogger';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {

  private logger = WinLogger.get('request-analyser');

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {

    const now = Date.now();

    const request = context.switchToHttp().getRequest();

    this.logger.debug(`Start request ${request.method} ${request.url}`);
    return next
      .handle().pipe(
        tap(() => {
          const reqTime = Date.now() - now;
          if (reqTime > 200) {
            this.logger.error(`End request ${reqTime}ms\n`);
          } else if (reqTime > 100) {
            this.logger.warn(`End request ${reqTime}ms\n`);
          } else {
            this.logger.debug(`End request ${reqTime}ms\n`);
          }
        })
      );
  }
}
