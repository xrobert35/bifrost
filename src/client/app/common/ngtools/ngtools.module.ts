

import { NgModule } from '@angular/core';
import {
  AsiInputModule, AsiTextareaModule, AsiButtonModule,
  AsiSelectModule, AsiAutoCompleteModule,
  AsiCheckBoxModule,
  AsiNotificationModule,
  AsiInputIconModule,
  AsiErrorMessagesModule,
  AsiServicesModule,
  AsiMenuModule,
  AsiRadioGroupModule,
  AsiTableModule,
  AsiNavGroupModule,
  AsiFileChooserModule,
  AsiDialogModule,
  AsiPipesModule,
  AsiCodeViewerModule,
  AsiCollapseModule,
  AsiSwitchModule
} from '@asi-ngtools/lib';
import { NotificationComponent } from './notification/notification.component';
import { BifrostNotificationService } from './notification/notification.service';

const modules = [
  AsiInputModule,
  AsiTextareaModule,
  AsiButtonModule,
  AsiSelectModule,
  AsiAutoCompleteModule,
  AsiCheckBoxModule,
  AsiNotificationModule,
  AsiInputIconModule,
  AsiErrorMessagesModule,
  AsiServicesModule,
  AsiRadioGroupModule,
  AsiMenuModule,
  AsiTableModule,
  AsiNavGroupModule,
  AsiFileChooserModule,
  AsiDialogModule,
  AsiPipesModule,
  AsiCodeViewerModule,
  AsiCollapseModule,
  AsiSwitchModule,
  AsiPipesModule
];

@NgModule({
  declarations: [NotificationComponent],
  imports: [modules],
  exports: [modules],
  entryComponents : [NotificationComponent],
  providers: [BifrostNotificationService]
})
export class NgToolsModule {
}
