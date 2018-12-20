import { Module } from '@nestjs/common';
import { FunctionalExceptionFilter } from './common/exception/function-exception.filter';
import { TechnicalExceptionFilter } from './common/exception/technical-exception.filter';
import { APP_FILTER } from '@nestjs/core';
import { RoutesModule } from './routes/routes.modules';

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
    }],
})
export class AppModule {
}
