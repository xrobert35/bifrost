import { ErrorHandler } from '@angular/core';
import { environment } from '@environments/environment';

// Possible sentry installation
// import * as Raven from 'raven-js';
// Raven
//   .config(`http://c751264c60b04f1ca0232b596063af99@${window.location.host}/sentry/2`)
//   .install();

export class UnivErrorHandler implements ErrorHandler {
  handleError(err: any): void {
    if (environment.SENTRY_ACTIVATED) {
      // Raven.captureException(err.originalError || err);
    }
    console.log(err);
  }
}
