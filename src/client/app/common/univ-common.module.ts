import { NgModule } from '@angular/core';
import { RestModule } from './rest/rest.module';
import { NgToolsModule } from './ngtools/ngtools.module';
import { CommonModule } from '@angular/common';
import { UniversalService } from './universal/universal.service';
import { MonacoEditorModule } from './components/monaco/monaco.module';
import { ConfirmDialog } from './components/dialog/confirm.dialog';
import { ContainerResolver } from './resolver/container.resolver';

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
    MonacoEditorModule
  ],
  entryComponents: [ConfirmDialog],
  providers: [UniversalService, ContainerResolver]
})
export class BifrostCommonModule {

}
