import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { share, map } from 'rxjs/operators';
import { Server } from '@shared/interface/server.int';
import { Observable } from 'rxjs';
import { UniversalService } from '../universal/universal.service';
import { ServerLocation } from '@shared/interface/serverLocation.int';

@Injectable()
export class ServerWebService {

  private baseUrl: string = null;

  constructor(private httpClient: HttpClient, private universalService: UniversalService) {
    this.baseUrl = `${this.universalService.getApiUrl()}/server`;
  }

  get(): Observable<Server> {
    return this.httpClient.get<Server>(`${this.baseUrl}`).pipe(share());
  }

  create(serverLocation: ServerLocation): Observable<ServerLocation> {
    return this.httpClient.post(`${this.baseUrl}/proxy`, serverLocation, { responseType: 'text' }).pipe(share(),
      map((reference: string) => {
        serverLocation.reference = reference;
        return serverLocation;
      }));
  }

  update(serverLocation: ServerLocation): Observable<ServerLocation> {
    return this.httpClient.put(`${this.baseUrl}/proxy/${serverLocation.reference}`, serverLocation, { responseType: 'text' }).pipe(share(),
      map((reference: string) => {
        serverLocation.reference = reference;
        return serverLocation;
      }));
  }

  delete(serverLocation: ServerLocation): Observable<void> {
    return this.httpClient.delete<void>(`${this.baseUrl}/proxy/${serverLocation.reference}`).pipe(share());
  }

  reload(): Observable<void> {
    return this.httpClient.post<void>(`${this.baseUrl}/reload`, null).pipe(share());
  }
}
