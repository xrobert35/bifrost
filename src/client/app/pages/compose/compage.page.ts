import { Component } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ComposeWebService } from '@rest/compose.webservice';
import { BifrostNotificationService } from 'client/app/common/ngtools/notification/notification.service';
import { ActivatedRoute } from '@angular/router';
import { Compose } from '@shared/interface/compose.int';

@Component({
  selector: 'compose-page',
  host: { 'class': 'compose-page page' },
  templateUrl: './compose.page.html'
})
export class ComposePage {

  newComposeForm: FormGroup;

  composes: Compose[] = [];

  selectedCompose: Compose;

  constructor(private formBuilder: FormBuilder,
    private composeService: ComposeWebService,
    private bifrostNotificationService: BifrostNotificationService,
    private activatedRoute: ActivatedRoute) {

    this.composes = this.activatedRoute.snapshot.data.composes;

    this.newComposeForm = this.formBuilder.group({
      name: [null, Validators.required],
      compose: [null, Validators.required]
    });
  }

  onFormSubmit() {
    if (this.newComposeForm.valid) {
      if (!this.selectedCompose) {
        this.composeService.create(this.newComposeForm.value).subscribe((compose) => {
          this.bifrostNotificationService.showInfo(`New docker compose has been added`);
          this.composes.push(compose);
        });
      } else {
        const compose = this.newComposeForm.value;
        compose.reference = this.selectedCompose.reference;
        this.composeService.update(compose).subscribe(() => {
          this.bifrostNotificationService.showInfo(`New docker compose has been updated`);
          Object.assign(this.selectedCompose, compose);
        });
      }

    }
  }

  selectCompose(compose: Compose) {
    this.selectedCompose = compose;
    this.newComposeForm.setValue(compose);
  }
}
