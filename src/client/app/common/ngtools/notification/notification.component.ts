import { Component } from '@angular/core';

@Component({
  selector: 'notification-component',
  templateUrl: './notification.component.html',
})
export class NotificationComponent {
  public message = '';

  constructor() {
  }
}
