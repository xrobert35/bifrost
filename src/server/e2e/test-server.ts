import { AppModule } from '../app/app.module';
import { WinLogger } from '../app/common/logger/winlogger';
import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AuthService } from '../app/security/auth.service';
import { AuthServiceMock } from './mock/auth.service.mock';
import { Connection } from 'typeorm';

/**
 * Classe permettant d'avoir une instance unique du serveur
 * pour la gestion des tests
 */
export class TestServer {

  private static logger = WinLogger.get('test');
  private static _app: INestApplication;

  /** Bootstrap the test server and return the application */
  static async bootstrap(): Promise<any> {
    jasmine.DEFAULT_TIMEOUT_INTERVAL = 30000;

    const module = await Test.createTestingModule({
      imports: [AppModule],
    }).overrideProvider(AuthService).useClass(AuthServiceMock).compile();

    const connection = module.get(Connection);
    connection.dropDatabase();

    this._app = module.createNestApplication();
    this._app.setGlobalPrefix('api');
    await this._app.init();
  }

  static getApplication(): INestApplication {
    return this._app;
  }

  static getHttpServer() {
    return this._app.getHttpServer();
  }

  static getLogger() {
    return this.logger;
  }
}
