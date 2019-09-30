import { ModuleWithProviders, NgModule } from '@angular/core';
import { MonacoEditorComponent } from './monaco.component';
import { MonacoEditorService } from './monaco.service';

@NgModule({
  declarations: [MonacoEditorComponent],
  imports: [],
  exports: [MonacoEditorComponent],
  entryComponents: [],
  providers: [MonacoEditorService]
})
export class MonacoEditorModule {

  static forRoot(): ModuleWithProviders {
    return {
      ngModule: MonacoEditorModule,
      providers: []
    };
  }
}
