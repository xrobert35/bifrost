import { Injectable } from '@nestjs/common';
import { Docker } from 'node-docker-api';
import { Container } from 'node-docker-api/lib/container';
import { WinLogger } from '@common/logger/winlogger';
import { Config } from '@config/config';
import { DockerContainer } from '@shared/interface/container.int';
import { Observable, Observer } from 'rxjs';
import { Stream } from 'stream';
import { TechnicalException } from '@common/exception/technical.exception';
import Bluebird = require('bluebird');
import shelljs = require('shelljs');

@Injectable()
export class DockerService {

  private docker: Docker;

  private readonly logger = WinLogger.get('docker-service');

  private auth: { [url: string]: { username: string, password: string } } = {};

  constructor() {
    this.docker = new Docker({ socketPath: '/var/run/docker.sock' });
  }

  async list(stack: string): Promise<DockerContainer[]> {
    this.logger.info('Listing container ');
    let containers = await this.docker.container.list({ all: true });
    if (stack) {
      containers = containers.filter(container =>
        (<DockerContainer>container.data).Labels['com.docker.compose.project'] === stack
      );
    }

    return await Bluebird.mapSeries(containers, async (container) => {
      return await this.getContainerDetail(container);
    });
  }

  async getContainer(containerId: string) {
    try {
      const container = await this.docker.container.get(containerId).status();
      return this.getContainerDetail(container);
    } catch (err) {
      this.logger.error(err);
      if (err.statusCode === 404) {
        throw new TechnicalException('container-not-found', err.message);
      }
      throw err;
    }
  }

  async getImageName(imageId: string) {
    const image = <any>await this.docker.image.get(imageId).status();

    let imageName = '';
    if (image.data.RepoTags && image.data.RepoTags.length > 0) {
      imageName = image.data.RepoTags[0];
    } else if (image.data.RepoDigests && image.data.RepoDigests.length > 0) {
      imageName = image.data.RepoDigests[0];
    }

    return imageName;
  }

  async updateContainer(containerId: string, info: any): Promise<DockerContainer> {
    this.logger.info('Recreating container ' + containerId);
    const container = await this.docker.container.get(containerId).status();

    try {
    await this.pullImage(info);
    } catch (err) {
      this.logger.error('Error while trying to update image', err);
      throw new TechnicalException('container-update-error', 'Error while trying to update container' + containerId);
    }
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
        tail: tail,
        timestamps: true
      });

      logsPromise.then((logStream: Stream) => {
        logStream.on('data', (buffer) => {
          // TODO 8 first byte are log status information
          const log = buffer.toString('utf8', 8, buffer.length);
          obs.next(log);
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
    const authKey = this.auth[repo];
    this.logger.info('pull image ' + info.image + ' with authKey ' + authKey);
    const stream = <any>await this.docker.image.create(authKey, { fromImage: info.image, pull: true });

    await new Promise((resolve, reject) => {
      stream.on('data', (data: any) => this.logger.log(data.toString()));
      stream.on('end', resolve);
      stream.on('error', () => reject);
    });
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

  private async getContainerDetail(container: Container): Promise<DockerContainer> {
    const dockerContainer = <DockerContainer>container.data;
    const imageFullName = await this.getImageName(dockerContainer.ImageID || dockerContainer.Image);
    if (imageFullName.indexOf('@') !== -1) {
      dockerContainer.Image = imageFullName.split('@')[0];
      dockerContainer.ImageDigestId = imageFullName.split('@')[1];
    } else {
      dockerContainer.Image = imageFullName;
    }
    if (dockerContainer.Labels) {
      dockerContainer.stack = dockerContainer.Labels['com.docker.compose.project'];
    }
    return dockerContainer;
  }

  manageCredentials() {
    this.logger.info('Initialise docker credentials');
    const keys = Config.get().DOCKER_REPO_KEYS.split(';');

    return Bluebird.each(keys, (key) => {
      return new Promise((resolve) => {
        const repoUrl = key.split(':')[0];
        const repoCred = key.split(':')[1];

        const user = repoCred.split('|')[0];
        const pwd = repoCred.split('|')[1];

        this.logger.info(`Login into ${repoUrl}...`);
        const proc = shelljs.exec(`echo ${pwd} | docker login ${repoUrl} --username ${user} --password-stdin`, (_code, stdout, stderr) => {
          this.logger.info(`${stdout || stderr}`);
        });
        proc.on('exit', () => {
          this.auth[repoUrl] = { username: user, password: pwd };
          resolve();
        });
      });
    });
  }
}
