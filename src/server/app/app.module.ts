import { Module } from '@nestjs/common';
import { FunctionalExceptionFilter } from './common/exception/function-exception.filter';
import { TechnicalExceptionFilter } from './common/exception/technical-exception.filter';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { RoutesModule } from './routes/routes.modules';
import { LoggingInterceptor } from '@common/interceptors/logging-interceptor';

@Module({
  imports: [RoutesModule],
  controllers: [],
  providers: [
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
    }
  ],
})
export class AppModule {
}
