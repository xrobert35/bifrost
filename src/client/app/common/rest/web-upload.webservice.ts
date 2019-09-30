import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { share } from 'rxjs/operators';
import { UniversalService } from '../universal/universal.service';
import { Folder } from '@shared/interface/folder.int';
import { AsiFileService } from '@asi-ngtools/lib';

@Injectable()
export class WebUploadWebService {

  private baseUrl: string = null;

  constructor(private httpClient: HttpClient,
    private asiFileService: AsiFileService,
    private universalService: UniversalService) {
    this.baseUrl = `${this.universalService.getApiUrl()}/web-upload`;
  }

  list() {
    return this.httpClient.get<Array<Folder>>(`${this.baseUrl}/folder/list`).pipe(share());
  }

  uploadFile(folder: Folder, fileInfo: File) {
    return this.asiFileService.uploadFile(`${this.baseUrl}/upload/${folder.reference}`, fileInfo);
  }
}
