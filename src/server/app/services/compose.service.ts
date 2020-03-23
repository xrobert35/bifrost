import { Injectable, HttpStatus } from '@nestjs/common';
import { WinLogger } from '@common/logger/winlogger';
import { Config } from '@config/config';
import { FunctionalException } from '@common/exception/functional.exception';
import { TechnicalException } from '@common/exception/technical.exception';
import { Compose } from '@shared/interface/compose.int';
import { ComposeOption } from '@shared/interface/compose.option.int';
import * as shortUid from 'short-uuid';
import * as fs from 'fs';
import * as shelljs from 'shelljs';
import { SocketInfo } from '@shared/interface/socket-into.int';
import Bluebird = require('bluebird');
import urlJoin = require('url-join');

@Injectable()
export class ComposeService {

  private static COMPOSES_CONFIG = `${Config.get().SERVER_DATA}/composes.json`;

  private composes: Compose[] = [];

  private readonly logger = WinLogger.get('compose-service');

  constructor() {
    this.readComposesJson();
  }

  public async createCompose(composeToCreate: Compose) {
    const aCompose = this.composes.find(compose => compose.name === composeToCreate.name);
    if (aCompose) {
      throw new FunctionalException('unique-compose-name', `Compose with name "${composeToCreate.name}" already exist`,
        HttpStatus.UNPROCESSABLE_ENTITY);
    }

    composeToCreate.reference = shortUid.generate();

    this.saveComposesJson();

    this.composes.push(composeToCreate);

    return composeToCreate.reference;

  }

  public updateCompose(compose: Compose): string {
    const oldCompose = this.getCompose(compose.reference);

    if (!oldCompose) {
      throw new TechnicalException('compose-not-found', `No commose found with reference "${compose.reference}"`, HttpStatus.NOT_FOUND);
    }

    Object.assign(oldCompose, compose);
    this.saveComposesJson();

    return compose.reference;
  }

  public deleteCompose(reference: string) {
    const filteredComposes = this.composes.filter(composeToFilter => {
      return composeToFilter.reference !== reference;
    });

    if (filteredComposes.length === this.composes.length) {
      throw new FunctionalException('compose-not-found', `Compose with the reference "${reference}" not found`);
    }

    this.composes = filteredComposes;

  }

  public getCompose(reference: string): Compose {
    const compose = this.composes.find(aCompose => aCompose.reference === reference);

    if (!compose) {
      throw new TechnicalException('compose-not-found', `No commose found with reference "${compose.reference}"`, HttpStatus.NOT_FOUND);
    }

    return compose;
  }

  public listComposes(): Compose[] {
    return this.composes;
  }

  public async scanComposes(): Promise<Compose[]> {
    const defaultComposeFolder = Config.get().DEFAULT_COMPOSE_FOLDER;
    this.logger.debug(`Scanning compose folder ${defaultComposeFolder}`);

    // looking for folder with a docker-compose file
    const dirContent = await fs.promises.readdir(defaultComposeFolder);

    // get only folder
    const composeFolders =  await Bluebird.filter(dirContent, async fileName => {
      const filePath = urlJoin(defaultComposeFolder, fileName);
      const fileInfo = await fs.promises.stat(filePath);
      if (fileInfo.isDirectory()) {
        return (await fs.promises.readdir(filePath)).find(afileName => afileName === 'docker-compose.yml') != null;
      }
      return false;
    });


    this.composes = await Bluebird.map(composeFolders, async composeFolder => {
      return {
        reference: shortUid.generate(),
        name: composeFolder,
        compose: await fs.promises.readFile(urlJoin(defaultComposeFolder, composeFolder, 'docker-compose.yml'),  'utf8')
      };
    });

    this.saveComposesJson();

    return this.composes;
  }

  public composeUp(reference: string, composeOption: ComposeOption) {
    this.logger.debug(`Running composeUp with reference : ${reference}`);

    const compose = this.getCompose(reference);

    if (!compose) {
      throw new TechnicalException('compose-not-found', `No commose found with reference "${compose.reference}"`, HttpStatus.NOT_FOUND);
    }

    let option = '';
    if (composeOption.compatibility) {
      option += '--compatibility ';
    }

    const defaultComposeFolder = Config.get().DEFAULT_COMPOSE_FOLDER;
    const cmd = `docker-compose ${option} -f '${defaultComposeFolder}/${compose.name}/docker-compose.yml' up -d`;

    this.logger.info(`> running : ${cmd}`);

    const logSocketId = `up-log-${shortUid}`;
    shelljs.exec(cmd, (code, stdout, stderr) => {
      this.logger.info(`${code} ${stdout || stderr}`);
    });

    return {
      reference: logSocketId
    };
  }

  public composeDown(reference: string, composeOption: ComposeOption): SocketInfo {
    this.logger.debug(`Running composeUp with reference : ${reference}`);

    const compose = this.getCompose(reference);

    if (!compose) {
      throw new TechnicalException('compose-not-found', `No commose found with reference "${compose.reference}"`, HttpStatus.NOT_FOUND);
    }

    let option = '';
    if (composeOption.compatibility) {
      option += '--compatibility ';
    }

    const defaultComposeFolder = Config.get().DEFAULT_COMPOSE_FOLDER;
    const cmd = `docker-compose ${option} -f '${defaultComposeFolder}/${compose.name}/docker-compose.yml' down`;

    this.logger.info(`> running : ${cmd}`);

    const logSocketId = `up-log-${shortUid}`;
    shelljs.exec(cmd, (code, stdout, stderr) => {
      this.logger.info(`${code} ${stdout || stderr}`);
    });

    return {
      reference: logSocketId
    };
  }

  /**
   * Save docker compose configuration and every docker-compose.yml files
   */
  private saveComposesJson() {
    this.logger.debug(`Save compose.json into : ${ComposeService.COMPOSES_CONFIG}`);
    fs.writeFileSync(ComposeService.COMPOSES_CONFIG, JSON.stringify(this.composes));

    const defaultComposeFolder = Config.get().DEFAULT_COMPOSE_FOLDER;
    this.composes.forEach((compose) => {
      let composeFolder = `${defaultComposeFolder}/${compose.name}`;
      if (!fs.existsSync(composeFolder)) {
        fs.mkdirSync(composeFolder, { recursive: true });
      }

      composeFolder = `${defaultComposeFolder}/${compose.name}/docker-compose.yml`;
      fs.writeFileSync(composeFolder, compose.compose);
    });
  }

  /**
   * Read the docker compose configuration
   */
  private readComposesJson() {
    try {
      if (fs.existsSync(ComposeService.COMPOSES_CONFIG)) {
        const composes = fs.readFileSync(ComposeService.COMPOSES_CONFIG, 'utf8');
        if (composes) {
          this.composes = JSON.parse(composes);
        }
      }
    } catch (err) {
      this.logger.error('Unabled to read composes list', err);
    }
  }
}
