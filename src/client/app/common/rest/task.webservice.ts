import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { share, map } from 'rxjs/operators';
import { UniversalService } from '../universal/universal.service';
import { Observable } from 'rxjs';
import { Task } from '@shared/interface/task.int';

@Injectable()
export class TaskWebService {

  private baseUrl: string = null;

  constructor(private httpClient: HttpClient, private universalService: UniversalService) {
    this.baseUrl = `${this.universalService.getApiUrl()}/task`;
  }

  get(reference: string): Observable<Task> {
    return this.httpClient.get<Task>(`${this.baseUrl}/${reference}`).pipe(share());
  }

  create(task: Task): Observable<Task> {
    return this.httpClient.post(`${this.baseUrl}`, task, { responseType: 'text' }).pipe(share(),
      map((reference: string) => {
        task.reference = reference;
        return task;
      }));
  }

  update(task: Task): Observable<string> {
    return this.httpClient.put(`${this.baseUrl}/${task.reference}`, task, { responseType: 'text' }).pipe(share());
  }

  delete(task: Task): Observable<void> {
    return this.httpClient.delete<void>(`${this.baseUrl}/${task.reference}`).pipe(share());
  }

  list() {
    return this.httpClient.get<Array<Task>>(`${this.baseUrl}/list`).pipe(share());
  }
}
