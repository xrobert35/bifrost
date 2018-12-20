import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as Mustache from 'mustache';
import { Server } from '@shared/interface/server.int';

@Injectable()
export class ServerService {

  server: Server;

  nginxTemplate: string;

  constructor() {
    this.readNginxTemplate();
    this.server = this.readServerJson();
  }

  async get() {
    return this.server;
  }

  async create(server: Server): Promise<Server> {
    this.server = server;

    Mustache.parse(this.nginxTemplate);
    const nginxConf = Mustache.render(this.nginxTemplate, server);

    this.saveServerJson(server);
    this.writeNginxConf(nginxConf);

    return server;
  }

  private readNginxTemplate() {
    this.nginxTemplate = fs.readFileSync(__dirname + '/../resources/nginx.conf', 'utf8');
  }

  private writeNginxConf(conf: string) {
    fs.writeFileSync('/opt/bifrost/nginx/nginx.conf', conf);
  }

  private saveServerJson(server: Server) {
    fs.writeFileSync('/opt/bifrost/server/server.json', JSON.stringify(server));
  }

  private readServerJson(): Server {
    try {
      const server = fs.readFileSync('/opt/bifrost/server/server.json', 'utf8');
      if (server) {
        this.server = JSON.parse(server);
      }
      return null;
    } catch (err) {
      return null;
    }
  }
}
