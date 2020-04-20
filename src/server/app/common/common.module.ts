import { Module } from '@nestjs/common';
import { BifrostSecurityModule } from './security/security.module';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { DefaultExceptionFilter } from './exception/default-exception.filter';
import { FunctionalExceptionFilter } from './exception/function-exception.filter';
import { TechnicalExceptionFilter } from './exception/technical-exception.filter';
import { LoggingInterceptor } from './interceptors/logging-interceptor';

@Module({
  imports: [BifrostSecurityModule],
  exports: [BifrostSecurityModule],
  controllers: [],
  providers: [{
    provide: APP_FILTER,
    useClass: DefaultExceptionFilter
  },
  {
    provide: APP_FILTER,
    useClass: FunctionalExceptionFilter,
  },
  {
    provide: APP_FILTER,
    useClass: TechnicalExceptionFilter,
  },
  {
    provide: APP_INTERCEPTOR,
    useClass: LoggingInterceptor,
  }],
})
export class BifrostCommonModule { }
