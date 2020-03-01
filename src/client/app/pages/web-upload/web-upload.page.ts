import { Component } from '@angular/core';
import { Folder } from '@shared/interface/folder.int';
import { ActivatedRoute } from '@angular/router';
import { WebUploadWebService } from '@rest/web-upload.webservice';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { BifrostNotificationService } from 'client/app/common/ngtools/notification/notification.service';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { remove, isEmpty, map } from 'lodash';
import { HttpEventType } from '@angular/common/http';
import { AsiDialogService } from '@asi-ngtools/lib';
import { FolderContentDialog } from './folder-content/folder-content.dialog';

@Component({
  selector: 'web-upload-page',
  host: { 'class': 'web-upload page' },
  templateUrl: './web-upload.page.html'
})
export class WebUploadPage {

  uploadableFolders: { folder: Folder, fileToUpload: File }[] = [];
  uploadedFiles: any[];
  folderForm: FormGroup;

  editedFolder: Folder;

  constructor(private webuploadWebService: WebUploadWebService,
    private formBuilder: FormBuilder,
    private webUploadWebService: WebUploadWebService,
    private bifrostNotificationService: BifrostNotificationService,
    private asiDialogService: AsiDialogService,
    private activatedRoute: ActivatedRoute) {

    const folders = this.activatedRoute.snapshot.data.folders;
    if (!isEmpty(folders)) {
      this.uploadableFolders = map(folders, (folder) => {
        return { folder: folder, fileToUpload: null };
      });
    }
    this.folderForm = this.formBuilder.group({
      libelle: [null, Validators.required],
      path: [null, Validators.required],
      reference: null
    });
  }

  submitFolder() {
    if (!this.editedFolder) {
      this.createFolder();
    } else {
      this.editFolder();
    }
  }

  /** Add a new folder */
  createFolder() {
    const newFolder: Folder = this.folderForm.value;
    this.webUploadWebService.create(newFolder).pipe(catchError(res => {
      if (res.error.fonctional) {
        this.bifrostNotificationService.showError(res.error.libelle);
      }
      return throwError(res);
    })).subscribe((folder) => {
      this.folderForm.reset();
      this.uploadableFolders.push({ folder: folder, fileToUpload: null });
      this.bifrostNotificationService.showInfo(`New folder has been added`);
    });
  }

  /** edit a new folder */
  editFolder() {
    const folder: Folder = this.folderForm.value;
    this.webUploadWebService.update(folder).pipe(catchError(res => {
      if (res.error.fonctional) {
        this.bifrostNotificationService.showError(res.error.libelle);
      }
      return throwError(res);
    })).subscribe(() => {
      Object.assign(this.editedFolder, folder);
      this.editedFolder = null;
      this.folderForm.reset();
      this.bifrostNotificationService.showInfo(`Folder has been edited`);
    });
  }

  /** Delete an existing folder */
  deleteFolder(folderToDelete: Folder) {
    this.webUploadWebService.delete(folderToDelete).subscribe(() => {
      remove(this.uploadableFolders, (folder) => folder.folder === folderToDelete);
      this.bifrostNotificationService.showInfo(`Folder has been removed`);
    });
  }

  /** start editing an existing folder */
  startEditFolder(folderToEdit: Folder) {
    this.editedFolder = folderToEdit;
    this.folderForm.setValue({
      libelle: folderToEdit.libelle,
      path: folderToEdit.path,
      reference: folderToEdit.reference
    });
  }

  endEditFolder() {
    this.editedFolder = null;
    this.folderForm.reset();
  }

  showFolderContent(folder: Folder) {
    this.webUploadWebService.get(folder.reference).pipe(catchError(err => {
      if (err.error.code) {
        this.bifrostNotificationService.showError(err.error.libelle);
      }
      return throwError(err);
    })).subscribe(folderContent => {
      const asiDialog = this.asiDialogService.fromComponent(FolderContentDialog, {});
      asiDialog.getComponent().filesInformation = folderContent;
    });
  }

  uploadFile(uploadableFolder: { folder: Folder, fileToUpload: File, progress: number }) {
    if (uploadableFolder.fileToUpload) {
      this.webuploadWebService.uploadFile(uploadableFolder.folder, uploadableFolder.fileToUpload).
        pipe(catchError((err) => {
          this.bifrostNotificationService.showError(`An error occured while uploading "${uploadableFolder.fileToUpload.name}"`);
          uploadableFolder.progress = null;
          throw err;
        })).subscribe((progress) => {
          switch (progress.type) {
            case HttpEventType.Sent:
              console.log(`Uploading file "${uploadableFolder.fileToUpload.name}" of size ${uploadableFolder.fileToUpload.size}.`);
              break;
            case HttpEventType.UploadProgress:
              // Compute and show the % done:
              const percentDone = Math.round(100 * progress.loaded / progress.total);
              uploadableFolder.progress = percentDone;
              break;
            case HttpEventType.Response:
              this.bifrostNotificationService.showInfo(`File "${uploadableFolder.fileToUpload.name}" is uploaded`);
              uploadableFolder.progress = null;
              uploadableFolder.fileToUpload = null;
              break;
          }
        });
    }
  }
}
