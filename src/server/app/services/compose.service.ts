import { Injectable, HttpStatus } from '@nestjs/common';
import { WinLogger } from '@common/logger/winlogger';
import { Config } from '@config/config';
import { FunctionalException } from '@common/exception/functional.exception';
import { TechnicalException } from '@common/exception/technical.exception';
import { Compose } from '@shared/interface/compose.int';
import * as shortUid from 'short-uuid';
import * as fs from 'fs';

@Injectable()
export class ComposeService {

  private static COMPOSES_CONFIG = `${Config.get().SERVER_DATA}/composes.json`;

  composes: Compose[] = [];

  nginxTemplate: string;

  private logger = WinLogger.get('compose-service');

  constructor() {
    this.readComposesJson();
  }

  public createCompose(composeToCreate: Compose) {
    const aCompose = this.composes.find(compose => compose.name === composeToCreate.name);
    if (aCompose) {
      throw new FunctionalException('unique-compose-name', `Compose with name "${composeToCreate.name}" already exist`,
        HttpStatus.UNPROCESSABLE_ENTITY);
    }

    composeToCreate.reference = shortUid.generate();

    this.composes.push(composeToCreate);

    this.saveComposesJson();

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
  }

  public getCompose(reference: string): Compose {
    return this.composes.find(compose => compose.reference === reference);
  }

  public listComposes(): Compose[] {
    return this.composes;
  }

  private saveComposesJson() {
    fs.writeFileSync(ComposeService.COMPOSES_CONFIG, JSON.stringify(this.composes));
  }

  private readComposesJson() {
    try {
      const composes = fs.readFileSync(ComposeService.COMPOSES_CONFIG, 'utf8');
      if (composes) {
        this.composes = JSON.parse(composes);
      }
    } catch (err) {
      this.logger.error('Unabled to read composes list', err);
    }
  }
}
