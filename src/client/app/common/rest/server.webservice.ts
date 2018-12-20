import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { share } from 'rxjs/operators';

@Injectable()
export class ServerWebService {

  constructor(private httpClient: HttpClient) {
  }

  list() {
    return this.httpClient.get('/api/server/list').pipe(share());
  }

  containers() {
    return this.httpClient.get('/api/server/containers').pipe(share());
  }
}
