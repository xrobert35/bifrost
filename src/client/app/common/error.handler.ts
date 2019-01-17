import { ErrorHandler } from '@angular/core';

export class UnivErrorHandler implements ErrorHandler {
  handleError(err: any): void {
    console.log(err);
  }
}
