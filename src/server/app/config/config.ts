import { WinLogger } from '../common/logger/winlogger';

import urlJoin = require('url-join');
import * as jsonOverride from 'json-override';

export class Config {

  private static instance: Config;

  private config: {
    SERVER_PORT: string,
    CLIENT_PORT: string;
    CLIENT_ACTIVATED: boolean;
    CLIENT_PROXY_ACTIVATED: boolean;
    SERVER_PATH: string,
    LOG_LEVEL: string,
    SWAGGER_ACTIVATED: string,
    AUTH_JWT_KEY: string, // JWT secret key to share with an auth service
    DOCKER_PRIVATE_REPO_BASE64_KEY: string,
    SERVER_DATA: string;
    UPLOAD_TMP_FOLDER: string;
    DEFAULT_COMPOSE_FOLDER: string;
  };

  private constructor() {
  }

  public static init() {
    if (!this.instance) {
      this.instance = new Config();
      this.instance.init();
    }
  }

  public static get() {
    return this.instance.config;
  }

  private init() {
    // get config folder
    const server_config_folder = process.env.NODE_SERVER_CONFIG_FOLDER || '.';

    // Read the default.js file
    this.config = this.getConfig(server_config_folder, 'default.js').config;

    const nodeEnv = process.env.NODE_ENV;

    if (nodeEnv) {
      try {
        const override = this.getConfig(server_config_folder, `${nodeEnv}.js`).config;
        jsonOverride(this.config, override);
        WinLogger.get('config').info(`Loading ${nodeEnv} configuration`);
      } catch (error) {
        WinLogger.get('config').warn(`No configuration found for ${nodeEnv}`);
      }
    }
  }

  private getConfig(path: string, configName: string) {
    return require(urlJoin(path, configName));
  }
}
