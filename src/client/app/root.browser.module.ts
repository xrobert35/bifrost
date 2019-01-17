import { NgModule } from '@angular/core';
import { RootModule } from './root.module';
import { RootComponent } from './root.component';
import { BrowserModule, BrowserTransferStateModule } from '@angular/platform-browser';

@NgModule({
  imports: [
    BrowserModule.withServerTransition({ appId: 'univ-base' }),
    BrowserTransferStateModule,
    RootModule,
  ],
  bootstrap: [RootComponent],
})
export class RootBrowserModule {
}
