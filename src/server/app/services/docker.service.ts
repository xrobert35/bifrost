import { Injectable } from '@nestjs/common';
import { Docker } from 'node-docker-api';
import { Container } from 'node-docker-api/lib/container';
import { WinLogger } from '@common/logger/winlogger';
import { Config } from '@config/config';
import { DockerContainer } from '@shared/interface/container.int';
import { Image } from 'node-docker-api/lib/image';

@Injectable()
export class DockerService {

  docker: Docker;

  private logger = WinLogger.get('docker-service');


  constructor() {
    this.docker = new Docker({ socketPath: '/var/run/docker.sock' });
  }

  async list() {
    this.logger.info('Listing container ');
    return this.docker.container.list({ all: true });
  }

  async getImageInfo(imageId: string) {
    return await this.docker.image.get(imageId).status();
  }

  getImageName(image: Image) {
    const imageInfo = <any>image.data;
    let imageName = null;
    if (imageInfo.RepoTags && imageInfo.RepoTags.length > 0) {
      imageName = imageInfo.RepoTags[0];
    } else if (imageInfo.RepoDigests && imageInfo.RepoDigests.length > 0) {
      const firstDigest = imageInfo.RepoDigests[0];
      if (firstDigest.indexOf('@') !== -1) {
        imageName = firstDigest.split('@')[0];
      } else {
        imageName = firstDigest;
      }
    }
    return imageName;
  }

  getImageDigestId(image: Image) {
    const imageInfo = <any>image.data;
    let imageDigestId = '';
    if (imageInfo.RepoDigests && imageInfo.RepoDigests.length > 0) {
      const firstDigest = imageInfo.RepoDigests[0];
      if (firstDigest.indexOf('@') !== -1) {
        imageDigestId = firstDigest.split('@')[1];
      }
    }
    return imageDigestId;
  }

  async updateContainer(containerId: string, info: any): Promise<DockerContainer> {
    this.logger.info('Recreating container ' + containerId);
    const container = await this.docker.container.get(containerId).status();

    await this.pullImage(info);
    // recreate container
    await container.stop();
    await container.delete();

    const newContainer = await this.recreateContainer(info, container);

    await newContainer.start();

    return <DockerContainer>newContainer.data;
  }

  private async pullImage(info) {
    let repo = null;
    if (info.image.indexOf('/') !== -1) {
      repo = info.image.split('/')[0];
    }

    // pull new version of the image
    const authKey = this.getAuthKeyForRepo(repo);
    let auth = null;
    if (authKey) {
      auth = { base64: authKey };
    }
    this.logger.info('pull image ' + info.image + ' with authKey ' + authKey);
    const stream = <any>await this.docker.image.create(auth, { fromImage: info.image, pull: true });

    await new Promise((resolve, reject) => {
      stream.on('data', data => this.logger.log(data.toString()));
      stream.on('end', resolve);
      stream.on('error', reject);
    });
  }

  private getAuthKeyForRepo(repoToFind: string) {
    const strRepoKeys = Config.get().DOCKER_PRIVATE_REPO_BASE64_KEY;
    if (strRepoKeys) {
      const repoKeys = strRepoKeys.split(';');
      const repoKey = repoKeys.find((key) => {
        return key.split(':')[0] === repoToFind;
      });
      if (repoKey) {
        return repoKey.split(':')[1];
      }
    }
    return null;
  }

  private async recreateContainer(info: any, container: Container): Promise<Container> {
    const newImage: any = await this.docker.image.get(info.image).status();

    const containerInfo: any = container.data;
    const newContainer = {
      ...containerInfo,
    };

    // reexpose binding port
    const exposedPort = newContainer.ExposedPorts || {};
    const portsBinded = Object.keys(newContainer.HostConfig.PortBindings);
    if (portsBinded && portsBinded.length > 0) {
      portsBinded.forEach((port) => {
        if (!exposedPort[port]) {
          exposedPort[port] = {};
        }
      });
    }
    newContainer.ExposedPorts = exposedPort;

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
