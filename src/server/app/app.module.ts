import { Module } from '@nestjs/common';
import { RoutesModule } from './routes/routes.modules';
import { LogGateway } from './routes/log.gateway';
import { BifrostCommonModule } from '@common/common.module';

@Module({
  imports: [RoutesModule, BifrostCommonModule],
  controllers: [],
  providers: [
    LogGateway
  ],
})
export class AppModule {}
