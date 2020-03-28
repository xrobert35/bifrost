import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DockerContainer } from '@shared/interface/container.int';

@Component({
  selector: 'docker-logs',
  host: { 'class': 'docker-logs page' },
  templateUrl: './docker-logs.page.html'
})
export class DockerLogsPage {

  container: DockerContainer;

  constructor(activatedRoute: ActivatedRoute) {
    activatedRoute.data.subscribe( (data) => {
      this.container = data.container;
    });
  }
}
