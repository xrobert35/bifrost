import { Injectable } from '@nestjs/common';
import { Docker } from 'node-docker-api';

@Injectable()
export class DockerService {

  docker: Docker;

  constructor() {
    this.docker = new Docker({ socketPath: '/var/run/docker.sock' });
    // this.docker = new Docker({ host : '192.168.56.101', port : '2375' });
  }

  async list() {
   return this.docker.container.list({ all: true });
  }

}
