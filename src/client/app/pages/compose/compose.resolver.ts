import { Resolve } from '@angular/router';
import { Injectable } from '@angular/core';
import { Compose } from '@shared/interface/compose.int';
import { ComposeWebService } from '@rest/compose.webservice';

@Injectable()
export class ComposesResolver implements Resolve<Compose[]> {

  constructor(private composeWebService: ComposeWebService) {
  }

  resolve() {
    return this.composeWebService.list();
  }

}
