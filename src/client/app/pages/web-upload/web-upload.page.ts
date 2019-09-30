import { Component } from '@angular/core';
import { Folder } from '@shared/interface/folder.int';
import { ActivatedRoute } from '@angular/router';
import { WebUploadWebService } from '@rest/web-upload.webservice';

@Component({
  selector: 'web-upload-page',
  host: { 'class': 'web-upload page' },
  templateUrl: './web-upload.page.html'
})
export class WebUploadPage {

  folders: Folder[];

  constructor(private webuploadWebService: WebUploadWebService,
    private activatedRoute: ActivatedRoute) {
    this.folders = this.activatedRoute.snapshot.data.folders;
  }

  async uploadFile(uploadInfo: Folder, fileToUpload: any) {
    await this.webuploadWebService.uploadFile(uploadInfo, fileToUpload.file);
  }

}
