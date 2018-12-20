import { Module } from '@nestjs/common';
import { ServerService } from './server.service';
import { DockerService } from './docker.service';

const services = [
  ServerService, DockerService
];

@Module({
  imports: [],
  providers: [...services],
  exports : [...services],
})
export class ServiceModule {}
