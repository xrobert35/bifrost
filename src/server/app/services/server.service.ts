import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as Mustache from 'mustache';
import { Server } from '@shared/interface/server.int';
import * as shelljs from 'shelljs';

@Injectable()
export class ServerService {

  server: Server;

  nginxTemplate: string;

  constructor() {
    this.readNginxTemplate();
    this.readServerJson();

    fs.mkdirSync('/etc/nginx/conf.d/', { recursive: true });
    fs.mkdirSync('/opt/bifrost/server',  {recursive : true});
  }

  async get() {
    return this.server;
  }

  async create(server: Server): Promise<Server> {
    this.saveServerJson(server);
    this.server = server;

    const mustacheServer = { ...server};
    mustacheServer.locations = this.server.locations.filter((location) => {
      return location.activated;
    });

    Mustache.parse(this.nginxTemplate);
    const nginxConf = Mustache.render(this.nginxTemplate, mustacheServer);

    this.writeNginxConf(nginxConf);

    return server;
  }

  private readNginxTemplate() {
    this.nginxTemplate = fs.readFileSync(__dirname + '/../resources/nginx.conf', 'utf8');
  }

  private writeNginxConf(conf: string) {
    fs.writeFileSync('/etc/nginx/conf.d//default.conf', conf);
    shelljs.exec('/usr/sbin/nginx -s reload');

  }

  private saveServerJson(server: Server) {
    fs.writeFileSync('/opt/bifrost/server/server.json', JSON.stringify(server));
  }

  private readServerJson() {
    try {
      const server = fs.readFileSync('/opt/bifrost/server/server.json', 'utf8');
      if (server) {
        this.server = JSON.parse(server);
      }
    } catch (err) {
    }
  }
}
