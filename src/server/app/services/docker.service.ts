import { Injectable } from '@nestjs/common';
import { Docker } from 'node-docker-api';
import { DockerContainer } from '@shared/interface/container.int';
import { Container } from 'node-docker-api/lib/container';

@Injectable()
export class DockerService {

  docker: Docker;

  constructor() {
    // this.docker = new Docker({ socketPath: '/var/run/docker.sock' });
    this.docker = new Docker({ host: '192.168.56.101', port: '2375' });
  }

  async list() {
    return this.docker.container.list({ all: true });
  }

  async getImageName(imageId: string) {
    const image = <any>await this.docker.image.get(imageId).status();
    return image.data.RepoTags[0];
  }

  async recreateContainer(containerId: string, info: any) {
    const container = await this.docker.container.get(containerId).status();
    const dockerContainer: DockerContainer = <DockerContainer>container.data;

    let repo = null;
    let fromImage = info.image.split(':')[0];
    if (fromImage.indexOf('/') !== -1) {
      repo = info.image.split('/')[0];
      fromImage = info.image.split('/')[1].split(':')[0];
    }

    const tag = info.image.split(':')[1];

    // pull new version of the image
    if (repo) {
      await this.docker.image.create({}, { repo, fromImage, tag, pull: true });
    } else {
      await this.docker.image.create({}, { fromImage, tag, pull: true });
    }
    // delete container
    await container.stop();
    await container.delete();

    // recreate container
    const newContainer = await this.createContainer(dockerContainer, info);

    await newContainer.start();
  }

  private async createContainer(dockerContainer: DockerContainer, info: any): Promise<Container> {
    const newContainer = {
      ...dockerContainer,
    };

    delete newContainer.ImageID;

    newContainer.Image = info.image;
    newContainer.name = dockerContainer.Name.substring(1);

    return await this.docker.container.create(newContainer);
  }

  async stopContainer(containerId: string) {
    await this.docker.container.get(containerId).stop();
  }

  async startContainer(containerId: string) {
    await this.docker.container.get(containerId).start();
  }

}
