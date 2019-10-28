import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ComposeWebService } from '@rest/compose.webservice';
import { BifrostNotificationService } from 'client/app/common/ngtools/notification/notification.service';
import { ActivatedRoute } from '@angular/router';
import { Compose } from '@shared/interface/compose.int';
import { remove } from 'lodash';
import { BifrostWebService } from '@rest/bifrost.webservice';

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
    private activatedRoute: ActivatedRoute) {

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
      if (!this.selectedCompose) {
        this.composeService.create(this.composeForm.value).subscribe((compose) => {
          this.bifrostNotificationService.showInfo(`New docker compose has been added`);
          this.composes.push(compose);
        });
      } else {
        const compose = this.composeForm.value;
        compose.reference = this.selectedCompose.reference;
        this.composeService.update(compose).subscribe(() => {
          this.bifrostNotificationService.showInfo(`New docker compose has been updated`);
          Object.assign(this.selectedCompose, compose);
        });
      }
    }
  }

  deleteCompose() {
    this.composeService.delete(this.selectedCompose).subscribe(() => {
      this.bifrostNotificationService.showInfo(`Docker compose "${this.selectCompose.name}" has been deleted`);
      remove(this.composes, (compose) => compose === this.selectedCompose);
      this.composeForm.reset();
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
}
