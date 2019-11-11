import { NgModule } from '@angular/core';
import { RestModule } from './rest/rest.module';
import { NgToolsModule } from './ngtools/ngtools.module';
import { CommonModule } from '@angular/common';
import { UniversalService } from './universal/universal.service';
import { MonacoEditorModule } from './components/monaco/monaco.module';

@NgModule({
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
  providers: [UniversalService]
})
export class UnivCommonModule {

}
