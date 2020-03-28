import { AsiDialogView, AsiTableData } from '@asi-ngtools/lib';
import { Component } from '@angular/core';
import { FileInformation } from '@shared/interface/file-info.int';

@Component({
  selector: 'folder-content-dialog',
  host: { 'class': 'folder-content dialog' },
  templateUrl: './folder-content.dialog.html'
})
export class FolderContentDialog extends AsiDialogView {

  public filesInformation: FileInformation[];

  refreshTable: () => AsiTableData<FileInformation> = () => {
    this.filesInformation.forEach(fileInfo => {
      fileInfo.size = Math.round(fileInfo.size / (1024 * 1024) * 10) / 10;
    });
    return {
      pageIndex: 0,
      totalPages: 0,
      totalElements: this.filesInformation.length,
      results: this.filesInformation,
      paginate: false
    };
  }

}
