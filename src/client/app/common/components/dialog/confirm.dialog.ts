import { AsiDialogView } from '@asi-ngtools/lib';
import { Component } from '@angular/core';

@Component({
  selector: 'confirm-dialog',
  host: { 'class': 'confirm dialog' },
  templateUrl: './confirm.dialog.html'
})
export class ConfirmDialog extends AsiDialogView {
  title: string;
  message: string;
}
