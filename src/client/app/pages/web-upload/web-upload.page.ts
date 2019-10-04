import { Component } from '@angular/core';
import { Folder } from '@shared/interface/folder.int';
import { ActivatedRoute } from '@angular/router';
import { WebUploadWebService } from '@rest/web-upload.webservice';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { BifrostNotificationService } from 'client/app/common/ngtools/notification/notification.service';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { remove, isEmpty, map } from 'lodash';

@Component({
  selector: 'web-upload-page',
  host: { 'class': 'web-upload page' },
  templateUrl: './web-upload.page.html'
})
export class WebUploadPage {

  uploadableFolders: { folder: Folder, fileToUpload: File }[];
  uploadedFiles: any[];
  newFolderForm: FormGroup;

  constructor(private webuploadWebService: WebUploadWebService,
    private formBuilder: FormBuilder,
    private webUploadWebService: WebUploadWebService,
    private bifrostNotificationService: BifrostNotificationService,
    private activatedRoute: ActivatedRoute) {

    const folders = this.activatedRoute.snapshot.data.folders;
    if (!isEmpty(folders)) {
      this.uploadableFolders = map(folders, (folder) => {
        return { folder: folder, fileToUpload: null };
      });
    }
    this.newFolderForm = this.formBuilder.group({
      libelle: [null, Validators.required],
      path: [null, Validators.required]
    });
  }

  /** Add a new folder */
  createFolder() {
    if (this.newFolderForm.valid) {
      const newFolder: Folder = this.newFolderForm.value;
      this.webUploadWebService.createFolder(newFolder).pipe(catchError(res => {
        if (res.error.fonctional) {
          this.bifrostNotificationService.showError(res.error.libelle);
        }
        return throwError(res);
      })).subscribe((folder) => {
        this.uploadableFolders.push({ folder : folder, fileToUpload : null});
        this.bifrostNotificationService.showInfo(`New folder has been added`);
      });
    }
  }

  /** Delete an existing folder */
  deleteFolder(folderToDelete: Folder) {
    this.webUploadWebService.delete(folderToDelete).subscribe(() => {
      remove(this.uploadableFolders, (folder) => folder.folder === folderToDelete);
      this.bifrostNotificationService.showInfo(`Folder has been removed`);
    });
  }

  uploadFile(uploadableFolder: { folder: Folder, fileToUpload: File }) {
    this.webuploadWebService.uploadFile(uploadableFolder.folder, uploadableFolder.fileToUpload).subscribe( () => {
      this.bifrostNotificationService.showInfo(`File uploaded`);
    });
  }

}
