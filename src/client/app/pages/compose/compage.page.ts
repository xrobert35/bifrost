import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ComposeWebService } from '@rest/compose.webservice';
import { BifrostNotificationService } from 'client/app/common/ngtools/notification/notification.service';
import { ActivatedRoute } from '@angular/router';
import { Compose } from '@shared/interface/compose.int';
import { BifrostWebService } from '@rest/bifrost.webservice';
import { AsiDialogService } from '@asi-ngtools/lib';
import { ConfirmDialog } from 'client/app/common/components/dialog/confirm.dialog';

@Component({
  selector: 'compose-page',
  host: { 'class': 'compose-page page' },
  templateUrl: './compose.page.html'
})
export class ComposePage implements OnInit {

  composeForm: FormGroup;
  composes: Compose[] = [];
  selectedCompose: Compose;
  defaultComposeFolder: string;

  constructor(private formBuilder: FormBuilder,
    private composeService: ComposeWebService,
    private bifrostNotificationService: BifrostNotificationService,
    private bifrostWebService: BifrostWebService,
    private activatedRoute: ActivatedRoute,
    private asiDialogService: AsiDialogService) {

    this.composes = this.activatedRoute.snapshot.data.composes;

    this.composeForm = this.formBuilder.group({
      name: [null, Validators.required],
      compose: [null, Validators.required],
      reference: null
    });
  }

  ngOnInit() {
    this.bifrostWebService.getConfig().subscribe(config => {
      this.defaultComposeFolder = config.defaultComposeFolder;
    });
  }

  onFormSubmit() {
    if (this.composeForm.valid) {
      const compose = this.composeForm.value;
      if (!this.selectedCompose) {
        this.composeService.create(compose).subscribe((createdCompose) => {
          this.bifrostNotificationService.showSuccess(`New docker compose has been added`);
          this.composes = this.composes.concat([createdCompose]);
          this.selectedCompose = createdCompose;
        });
      } else {
        this.composeService.update(compose).subscribe(() => {
          this.bifrostNotificationService.showSuccess(`Docker compose has been updated`);
          Object.assign(this.selectedCompose, compose);
        });
      }
    }
  }

  deleteCompose() {
    const dialog = this.asiDialogService.fromComponent(ConfirmDialog, {});
    dialog.getComponent().title = 'Please confirm';
    dialog.getComponent().message = 'Are your sure you want to delete this docker compose ?';
    dialog.onDialogClose().subscribe(() => {
      this.composeService.delete(this.selectedCompose).subscribe(() => {
        this.bifrostNotificationService.showInfo(`Docker compose '${this.selectedCompose.name}' has been deleted`);
        this.composes = this.composes.filter(compose => compose !== this.selectedCompose);
        this.endEditCompose();
      });
    });
  }

  upCompose() {
    this.composeService.up(this.selectedCompose, { compatibility: true }).subscribe(() => {
      this.bifrostNotificationService.showInfo(`Docker compose '${this.selectedCompose.name}' is up`);
    });
  }

  downCompose() {
    this.composeService.down(this.selectedCompose, { compatibility: true }).subscribe(() => {
      this.bifrostNotificationService.showInfo(`Docker compose '${this.selectedCompose.name}' is down`);
    });
  }

  endEditCompose() {
    this.selectedCompose = null;
    this.composeForm.reset();
  }

  selectCompose(compose: Compose) {
    this.selectedCompose = compose;
    this.composeForm.setValue(compose);
  }

  scanComposes() {
    this.composeService.scan().subscribe(composes => {
      this.composes = composes;
      this.bifrostNotificationService.showSuccess(`Scan complete : ${composes.length} docker-compose found`);
    });
  }
}
