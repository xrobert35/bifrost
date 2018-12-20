import { Module } from '@nestjs/common';
import { ServiceModule } from '@services/service.module';
import { ServerController } from './server.controller';

@Module({
  imports: [ServiceModule],
  controllers: [ServerController],
  exports : [ServiceModule],
})
export class RoutesModule {}
