import { Injectable } from '@nestjs/common';
import { Docker } from 'node-docker-api';
import { Container } from 'node-docker-api/lib/container';
import { WinLogger } from '@common/logger/winlogger';
import { Config } from '@config/config';
import { DockerContainer } from '@shared/interface/container.int';
import { Observable, Observer } from 'rxjs';
import { Stream } from 'stream';
import { TechnicalException } from '@common/exception/technical.exception';

@Injectable()
export class DockerService {

  private docker: Docker;

  private readonly logger = WinLogger.get('docker-service');

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
    if (image.data.RepoDigests && image.data.RepoDigests.length > 0) {
      imageName = image.data.RepoDigests[0];
    } else if (image.data.RepoTags && image.data.RepoTags.length > 0) {
      imageName = image.data.RepoTags[0];
    }

    return imageName;
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

  streamLog(containerId: string, tail: number): Observable<string> {
    return Observable.create((obs: Observer<string>) => {
      const logsPromise = this.docker.container.get(containerId).logs({
        follow: true,
        stdout: true,
        stderr: true,
        tail: tail
      });

      logsPromise.then((logStream: Stream) => {
        logStream.on('data', (buffer) => {
          // TODO 8 first byte are log status information
          obs.next(buffer.toString('utf8', 8, buffer.length));
        });
        logStream.on('close', () => {
          obs.complete();
        });
        logStream.on('error', (err) => {
          this.logger.warn(`Something went wrong while reading log for container ${containerId}`, err);
          obs.complete();
        });
      }).catch((err) => {
        this.logger.warn(`Enable to read log for container ${containerId}`, err);
      });
    });
  }

  private async pullImage(info: any) {
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
      stream.on('data', (data: any) => this.logger.log(data.toString()));
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
    try {
      await this.docker.container.get(containerId).start();
    } catch (err) {
      this.logger.error(err);
      if (err.statusCode === 404) {
        throw new TechnicalException('container-not-found', err.message);
      }
      throw err;
    }
  }

  async prune() {
    this.logger.info('Starting prune');
    return await this.docker.image.prune();
  }
}
