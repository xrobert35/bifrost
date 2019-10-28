import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { share } from 'rxjs/operators';
import { UniversalService } from '../universal/universal.service';

@Injectable()
export class BifrostWebService {

  private baseUrl: string = null;

  constructor(private httpClient: HttpClient, private universalService: UniversalService) {
    this.baseUrl = `${this.universalService.getApiUrl()}/bifrost`;
  }

  getConfig() {
    return this.httpClient.get<any>(`${this.baseUrl}/config`).pipe(share());
  }
}
