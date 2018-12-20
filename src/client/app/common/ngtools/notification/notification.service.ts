import { Injectable } from '@angular/core';
import { AsiNotificationService } from '@asi-ngtools/lib';
import { AsiNotificationPosition } from '@asi-ngtools/lib';
import { AsiNotificationType } from '@asi-ngtools/lib';
import { NotificationComponent } from './notification.component';

@Injectable()
export class InexysNotificationService {

  private baseDelay = 2000;

  constructor(private asiNotificationService: AsiNotificationService) {
  }

  showWarning(message: string) {
    const asiNotificationTR = this.asiNotificationService.fromComponent(NotificationComponent, {
      position: AsiNotificationPosition.TOP_RIGHT,
      type: AsiNotificationType.WARNING,
      delayInMs: this.baseDelay,
      withIcon: true
    });
    asiNotificationTR.getComponent().message = message;
  }

  showError(message: string) {
    const asiNotificationTR = this.asiNotificationService.fromComponent(NotificationComponent, {
      position: AsiNotificationPosition.TOP_RIGHT,
      type: AsiNotificationType.ERROR,
      delayInMs: this.baseDelay,
      withIcon: true
    });
    asiNotificationTR.getComponent().message = message;
  }

  showSuccess(message: string) {
    const asiNotificationTR = this.asiNotificationService.fromComponent(NotificationComponent, {
      position: AsiNotificationPosition.TOP_RIGHT,
      type: AsiNotificationType.SUCCESS,
      delayInMs: this.baseDelay,
      withIcon: true
    });
    asiNotificationTR.getComponent().message = message;
  }

  showInfo(message: string) {
    const asiNotificationTR = this.asiNotificationService.fromComponent(NotificationComponent, {
      position: AsiNotificationPosition.TOP_RIGHT,
      type: AsiNotificationType.INFO,
      delayInMs: this.baseDelay,
      withIcon: true
    });
    asiNotificationTR.getComponent().message = message;
  }
}
