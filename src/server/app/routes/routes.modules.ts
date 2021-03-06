import { Module } from '@nestjs/common';
import { ServiceModule } from '@services/service.module';
import { ServerController } from './server.controller';
import { DockerController } from './docker.controller';
import { TaskController } from './task.controller';
import { WebUploadController } from './web-upload.controller';
import { ComposeController } from './compose.controller';
import { BifrostController } from './bifrost.controller';

@Module({
  imports: [ServiceModule],
  controllers: [DockerController,
    ServerController,
    WebUploadController,
    TaskController,
    ComposeController,
    BifrostController],
  exports: [ServiceModule]
})
export class RoutesModule { }
