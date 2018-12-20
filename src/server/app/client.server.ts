// GitHub source: server.js
import 'zone.js/dist/zone-node';
import 'reflect-metadata';
import * as express from 'express';
import { join } from 'path';
import { enableProdMode } from '@angular/core';
import { Config } from '@config/config';
import { ngExpressEngine } from '@nguniversal/express-engine';
import { WinLogger } from '@common/logger/winlogger';
import { INestApplication } from '@nestjs/common';
import * as cookieParser from 'cookie-parser';

const DIST_FOLDER = join(process.cwd(), 'dist/client');
const { RootServerModuleNgFactory, LAZY_MODULE_MAP } = require(join(DIST_FOLDER, 'server/main'));
const { provideModuleMap } = require('@nguniversal/module-map-ngfactory-loader');
const proxyMiddleware = require('http-proxy-middleware');
export class ClientServer {

  static clientInstance: ClientServer;

  private CLIENT_PORT = Config.get().CLIENT_PORT || 4000;
  private logger = WinLogger.get('client-server');

  static bootstrap(app: INestApplication) {
    return new Promise((resolve) => {
      this.clientInstance = new ClientServer(app);
      this.clientInstance.initServer(resolve);
    });
  }

  constructor(_app: INestApplication) {
  }

  private initServer(done) {
    // Faster server renders w/ Prod mode (dev mode never needed)
    enableProdMode();
    const app = express();

    app.use(cookieParser());

    if (Config.get().CLIENT_PROXY_ACTIVATED) {
      this.logger.info('Loading proxy from proxy.conf.json');
      const proxies = require('../../../proxy.conf.json');
      for (const proxyName of Object.keys(proxies)) {
        const proxy = proxies[proxyName];
        proxy.logProvider = () => this.logger;
        app.use(proxyName, proxyMiddleware(proxyName, proxy));
      }
    }

    // Universal express-engine (found @ https://github.com/angular/universal/tree/master/modules/express-engine)
    app.engine('html', (_: any, options: any, callback: any) => {
      const engine = ngExpressEngine({
        bootstrap: RootServerModuleNgFactory,
        providers: [provideModuleMap(LAZY_MODULE_MAP),
        { provide: 'request', useFactory: () => options.req, deps: [] },
        { provide: 'REQUEST', useFactory: () => options.req, deps: [] },
        { provide: 'RESPONSE', useFactory: () => options.req.res, deps: [] }]
      });
      engine(_, options, callback);
    });
    app.set('view engine', 'html');
    app.set('views', join(DIST_FOLDER, 'browser'));

    // Server static files from /browser
    app.use('/views', express.static(join(DIST_FOLDER, 'browser'), {
      maxAge: '1y'
    }));

    app.get('/views/*', async (req: any, _res: any, next: any) => {
      req.asiNgtools = {
        language: req.headers['accept-language']
      };
      req.ROOT_FOLDER = join(DIST_FOLDER, 'browser');
      req.BASE_URL = `http://localhost:${this.CLIENT_PORT}`;
      next();
    }, (req: any, res: any) => {
      this.logger.debug(`Start rendering ${req.path} ${new Date()}`);
      res.render(join(DIST_FOLDER, 'browser', 'index.html'), { req, res }, (_err: any, html: any) => {
        this.logger.debug(`End rendering ${req.path}  ${new Date()}`);
        if (_err) {
          this.logger.error(`An error occured while rendering ${req.path} `, _err);
        }
        res.send(html);
      });
    });

    // error middleware
    app.use(this.manageError);

    app.get('*', (_req: any, res: any) => {
      res.redirect('/views');
    });

    // Start up the Node server
    app.listen(this.CLIENT_PORT, () => {
      done();
    });
  }


  private manageError(err: any, _req: any, _res: any, _next: any) {
    console.log('Error while rendering ' + err);
  }
}
