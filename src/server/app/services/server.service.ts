import { Injectable } from '@nestjs/common';
import { Server } from '@shared/interface/server.int';
import { ServerLocation } from '@shared/interface/serverLocation.int';
import { FunctionalException } from '@common/exception/functional.exception';

import { Config } from '@config/config';
import fs = require('fs');
import Mustache = require('mustache');
import shortUid = require('short-uuid');
import shelljs = require('shelljs');
import Tail = require('nodejs-tail');
import { WinLogger } from '@common/logger/winlogger';
import { Observable, Observer } from 'rxjs';
import { TechnicalException } from '@common/exception/technical.exception';

@Injectable()
export class ServerService {

  private static SERVER_CONFIG = `${Config.get().SERVER_DATA}/server.json`;

  server: Server;

  nginxTemplate: string;

  private logger = WinLogger.get('server-service');

  constructor() {
    this.readNginxTemplate();
    this.readServerJson();

    try {
      fs.mkdirSync('/etc/nginx/conf.d/', { recursive: true });
    } catch (err) {
      this.logger.error('Fail to create folder for nginx', err);
    }

    fs.mkdirSync('/opt/bifrost/server', { recursive: true });
  }

  get(): Server {
    return this.server;
  }

  public addProxy(proxy: ServerLocation): string {
    proxy.reference = shortUid.generate();

    const existingProxy = this.server.locations.find(location => location.name === proxy.name);
    if (existingProxy) {
      throw new FunctionalException('unique-proxy-name', `A proxy with the name "${proxy.name}" already exist`);
    }

    this.server.locations.push(proxy);
    this.saveServer();
    return proxy.reference;
  }

  public editProxy(proxy: ServerLocation): string {
    const proxyToEdit = this.server.locations.find((proxyToFind) =>
      proxyToFind.reference === proxy.reference
    );

    Object.assign(proxyToEdit, proxy);

    this.saveServer();

    return proxy.reference;
  }

  public deleteProxy(reference: string) {
    const filteredProxy = this.server.locations.filter(proxyToFilter => {
      return proxyToFilter.reference !== reference;
    });

    if (this.server.locations.length === filteredProxy.length) {
      throw new FunctionalException('proxy-not-found', `Proxy with the reference "${reference}" not found`);
    }

    this.server.locations = filteredProxy;

    this.saveServer();
  }

  public streamLog(logFile: string, logLength: number): Observable<string> {
    return Observable.create((observer: Observer<string>) => {
      const file = `/var/log/nginx/${logFile}`;
      const initTail = shelljs.tail({ '-n': logLength }, file);
      const lines = initTail.toString().split('\n');
      lines.pop();
      lines.forEach((line) => {
        observer.next(line);
      });
      const tail = new Tail(`/var/log/nginx/${logFile}`);
      tail.on('line', (line: string) => {
        observer.next(line);
      });
      tail.on('close', () => {
        observer.complete();
      });
      tail.watch();
    });
  }

  public writeAndReloadNginxConf(): Observable<string> {
    const conf = Mustache.render(this.nginxTemplate, this.server);
    return Observable.create((observer: Observer<string>) => {
      try {
        fs.writeFileSync('/etc/nginx/conf.d/default.conf', conf);
        const proc = shelljs.exec('/usr/sbin/nginx -s reload', (_code, stdout) => {
          this.logger.info(stdout);
        });
        proc.on('exit', () => {
          observer.complete();
        });
      } catch (err) {
        observer.error(new TechnicalException('nginx-error', `Unabled to write and reload nginx configuration`, err, 500));
      }
    });
  }

  private saveServer() {
    this.saveServerJson(this.server);
  }

  private saveServerJson(server: Server) {
    fs.writeFileSync(ServerService.SERVER_CONFIG, JSON.stringify(server));
  }

  /**
   * Read the nginx proxy conf
   */
  private readNginxTemplate() {
    this.nginxTemplate = fs.readFileSync(__dirname + '/../resources/nginx.conf', 'utf8');
    Mustache.parse(this.nginxTemplate);
  }

  /**
   * Read the save file server.json to init the service
   */
  private readServerJson() {
    if (fs.existsSync(ServerService.SERVER_CONFIG)) {
      try {
        const server = fs.readFileSync(ServerService.SERVER_CONFIG, 'utf8');
        if (server) {
          this.server = JSON.parse(server);
        } else {
          this.server = { port: 80, serverName: 'localhost', onlyActive: false, locations: [] };
        }
      } catch (err) {
        this.logger.error('Unabled to read server configuration', err);
      }
    } else {
      this.server = { onlyActive: false, locations: [] };
    }
  }
}
