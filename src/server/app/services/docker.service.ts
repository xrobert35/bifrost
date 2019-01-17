import { Injectable } from '@nestjs/common';
import { Docker } from 'node-docker-api';
import { Container } from 'node-docker-api/lib/container';
import { WinLogger } from '@common/logger/winlogger';
import { Config } from '@config/config';

@Injectable()
export class DockerService {

  docker: Docker;

  private logger = WinLogger.get('docker-service');


  constructor() {
    this.docker = new Docker({ socketPath: '/var/run/docker.sock' });
    // this.docker = new Docker({ host: '192.168.56.101', port: '2375' });
  }

  async list() {
    this.logger.info('Listing container ');
    return this.docker.container.list({ all: true });
  }

  async getImageName(imageId: string) {
    const image = <any>await this.docker.image.get(imageId).status();

    let imageName = '';
    if (image.data.RepoTags && image.data.RepoTags.length > 0) {
      imageName = image.data.RepoTags[0];
    } else if (image.data.RepoDigests && image.data.RepoDigests.length > 0) {
      imageName = image.data.RepoDigests[0].split('@')[0];
    }

    return imageName;
  }

  async updateContainer(containerId: string, info: any) {
    this.logger.info('Recreating container ' + containerId);
    const container = await this.docker.container.get(containerId).status();

    let repo = null;
    let fromImage = info.image.split(':')[0];
    if (fromImage.indexOf('/') !== -1) {
      repo = info.image.split('/')[0];
      fromImage = info.image.split('/')[1].split(':')[0];
    }

    const tag = info.image.split(':')[1];

    // pull new version of the image
    if (repo) {
      const authKey = Config.get().DOCKER_PRIVATE_REPO_BASE64_KEY;
      let auth = {};
      if (authKey) {
        auth = { base64: authKey };
      }
      await this.docker.image.create(auth,
        { repo, fromImage: repo + '/' + fromImage, tag, pull: true });
    } else {
      await this.docker.image.create({}, { fromImage, tag, pull: true });
    }
    // recreate container
    await container.stop();
    await container.delete();

    const newContainer = await this.recreateContainer(info, container);

    await newContainer.start();
  }

  private async recreateContainer(info: any, container: Container): Promise<Container> {

    const newImage: any = await this.docker.image.get(info.image).status();

    const containerInfo: any = container.data;
    const newContainer = {
      ...containerInfo,
    };

    this.logger.info('new image id ' + newImage.data.Id);

    newContainer.Image = info.image;
    newContainer.ImageID = newImage.data.Id;

    newContainer.name = containerInfo.Name.substring(1);

    return await this.docker.container.create(newContainer);
  }

  async stopContainer(containerId: string) {
    this.logger.info('Stopping container ' + containerId);
    await this.docker.container.get(containerId).stop();
  }

  async deleteContainer(containerId: string) {
    this.logger.info('Deleting container ' + containerId);
    await this.docker.container.get(containerId).stop();
    await this.docker.container.get(containerId).delete();
  }

  async startContainer(containerId: string) {
    this.logger.info('Starting container ' + containerId);
    await this.docker.container.get(containerId).start();
  }

  async prune() {
    this.logger.info('Starting prune');
    return await this.docker.image.prune();
  }
}
