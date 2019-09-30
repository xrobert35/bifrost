import { Resolve } from '@angular/router';
import { Injectable } from '@angular/core';
import { Folder } from '@shared/interface/folder.int';
import { WebUploadWebService } from '@rest/web-upload.webservice';

@Injectable()
export class FoldersResolver implements Resolve<Folder[]> {

  constructor(private webUploadWebService: WebUploadWebService) {
  }

  resolve() {
    return this.webUploadWebService.list();
  }

}
