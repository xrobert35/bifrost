import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { share, map } from 'rxjs/operators';
import { UniversalService } from '../universal/universal.service';
import { Compose } from '@shared/interface/compose.int';
import { Observable } from 'rxjs';
import { ComposeOption } from '@shared/interface/compose.option.int';

@Injectable()
export class ComposeWebService {

  private baseUrl: string = null;

  constructor(private httpClient: HttpClient, private universalService: UniversalService) {
    this.baseUrl = `${this.universalService.getApiUrl()}/compose`;
  }

  get(reference: string): Observable<Compose> {
    return this.httpClient.get<Compose>(`${this.baseUrl}/${reference}`).pipe(share());
  }

  create(compose: Compose): Observable<Compose> {
    return this.httpClient.post(`${this.baseUrl}`, compose, { responseType: 'text' }).pipe(share(),
      map((reference: string) => {
        compose.reference = reference;
        return compose;
      }));
  }

  update(compose: Compose): Observable<string> {
    return this.httpClient.put(`${this.baseUrl}/${compose.reference}`, compose, { responseType: 'text' }).pipe(share());
  }


  delete(compose: Compose): Observable<void> {
    return this.httpClient.delete<void>(`${this.baseUrl}/${compose.reference}`).pipe(share());
  }

  up(compose: Compose, composeOptions: ComposeOption): Observable<void> {
    return this.httpClient.post<void>(`${this.baseUrl}/up/${compose.reference}`, composeOptions).pipe(share());
  }

  down(compose: Compose, composeOptions: ComposeOption): Observable<void> {
    return this.httpClient.post<void>(`${this.baseUrl}/down/${compose.reference}`, composeOptions).pipe(share());
  }

  scan() {
    return this.httpClient.get<Array<Compose>>(`${this.baseUrl}/scan`).pipe(share());
  }

  list() {
    return this.httpClient.get<Array<Compose>>(`${this.baseUrl}/list`).pipe(share());
  }
}
