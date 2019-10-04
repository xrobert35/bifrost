import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { share, map } from 'rxjs/operators';
import { UniversalService } from '../universal/universal.service';
import { Folder } from '@shared/interface/folder.int';
import { AsiFileService } from '@asi-ngtools/lib';
import { Observable } from 'rxjs';

@Injectable()
export class WebUploadWebService {

  private baseUrl: string = null;

  constructor(private httpClient: HttpClient,
    private asiFileService: AsiFileService,
    private universalService: UniversalService) {
    this.baseUrl = `${this.universalService.getApiUrl()}/web-upload`;
  }

  createFolder(folder: Folder): Observable<Folder> {
    return this.httpClient.post(`${this.baseUrl}/folder`, folder, { responseType: 'text' }).pipe(share(),
      map((reference: string) => {
        folder.reference = reference;
        return folder;
      }));
  }

  delete(folder: Folder): Observable<void> {
    return this.httpClient.delete<void>(`${this.baseUrl}/folder/${folder.reference}`).pipe(share());
  }

  list() {
    return this.httpClient.get<Array<Folder>>(`${this.baseUrl}/folder/list`).pipe(share());
  }

  uploadFile(folder: Folder, fileInfo: File) {
    return this.asiFileService.uploadFile(`${this.baseUrl}/upload/${folder.reference}`, fileInfo);
  }
}
