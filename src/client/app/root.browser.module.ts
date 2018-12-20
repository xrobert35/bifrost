import { NgModule } from '@angular/core';
import { RootModule } from './root.module';
import { RootComponent } from './root.component';
import { BrowserModule, BrowserTransferStateModule } from '@angular/platform-browser';
import { BrowserCookiesModule } from '@ngx-utils/cookies/browser';

@NgModule({
  imports: [
    BrowserModule.withServerTransition({ appId: 'univ-base' }),
    BrowserTransferStateModule,
    BrowserCookiesModule.forRoot(),
    RootModule,
  ],
  bootstrap: [RootComponent],
})
export class RootBrowserModule {
}
