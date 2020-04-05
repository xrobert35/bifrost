import { Module } from '@nestjs/common';
import { ServerService } from './server.service';
import { DockerService } from './docker.service';
import { ComposeService } from './compose.service';
import { TaskService } from './task.service';
import { WebUploadService } from './web-upload.service';
import { TaskLogsService } from './taskLogs.service';

const services = [
  ServerService, DockerService, ComposeService, TaskService, WebUploadService, TaskLogsService
];

@Module({
  imports: [],
  providers: [...services],
  exports: [...services],
})
export class ServiceModule { }
