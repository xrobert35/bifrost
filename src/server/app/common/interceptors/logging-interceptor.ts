import { Injectable, NestInterceptor, ExecutionContext } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { WinLogger } from '@common/logger/winlogger';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {

  private logger = WinLogger.get('docker-service');

  intercept(context: ExecutionContext, call$: Observable<any>): Observable<any> {

    const now = Date.now();

    const requestUrl = context.switchToHttp().getRequest().url;

    this.logger.debug(`Start request ${requestUrl}`);

    return call$
      .pipe(
        tap(() => {
          const reqTime =  Date.now() - now;
          if (reqTime > 200) {
            this.logger.error(`End request ${reqTime}ms`);
          } else if (reqTime > 100) {
            this.logger.warn(`End request ${reqTime}ms`);
          } else {
            this.logger.info(`End request ${reqTime}ms`);
          }
        })
      );
  }
}
