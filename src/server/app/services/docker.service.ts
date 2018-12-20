import { Injectable } from '@nestjs/common';
import { Docker } from 'node-docker-api';

@Injectable()
export class DockerService {

  docker: Docker;

  constructor() {
    this.docker = new Docker({ socketPath: '/var/run/docker.sock' });
  }

  async list() {
   return this.docker.container.list();
  }

}
