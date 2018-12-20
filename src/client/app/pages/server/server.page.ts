import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DockerContainer } from '@shared/interface/container.int';
import { Server } from '@shared/interface/server.int';

@Component({
  selector: 'server-page',
  templateUrl: './server.page.html'
})
export class ServerPage {

  containers: Array<DockerContainer>;
  servers: Array<Server>;

  constructor(private activatedRoute: ActivatedRoute) {
    this.containers = this.activatedRoute.snapshot.data.containers;
    this.servers = this.activatedRoute.snapshot.data.servers;
  }


}
