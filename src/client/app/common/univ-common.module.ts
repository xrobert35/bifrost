import { NgModule } from '@angular/core';
import { RestModule } from './rest/rest.module';
import { NgToolsModule } from './ngtools/ngtools.module';
import { CommonModule } from '@angular/common';
import { UniversalService } from './universal/universal.service';
import { ConfirmDialog } from './components/dialog/confirm.dialog';
import { ContainerResolver } from './resolver/container.resolver';
import { MonacoEditorModule } from './components/monaco/monaco.module';
import { EnsureUserAuthGuard } from './security/auth.guard';
import { UserStore } from './security/user.store';

@NgModule({
  declarations: [ConfirmDialog],
  imports: [
    CommonModule,
    RestModule,
    NgToolsModule,
    MonacoEditorModule
  ],
  exports: [
    CommonModule,
    RestModule,
    NgToolsModule,
    MonacoEditorModule,
  ],
  entryComponents: [ConfirmDialog],
  providers: [UniversalService, ContainerResolver, EnsureUserAuthGuard, UserStore]
})
export class BifrostCommonModule {

}
