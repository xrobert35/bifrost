import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'proxy-logs',
  host: { 'class': 'proxy-logs page' },
  templateUrl: './proxy-logs.page.html'
})
export class ProxyLogsPage {

  logId: string;

  constructor(activatedRoute: ActivatedRoute) {
    activatedRoute.params.subscribe( (data) => {
      this.logId = data.type;
    });
  }
}
