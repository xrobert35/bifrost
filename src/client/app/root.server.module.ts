// GitHub source: src/app/app.server.module.ts
import { NgModule } from '@angular/core';
import { ServerModule, ServerTransferStateModule } from '@angular/platform-server';
import { RootModule } from './root.module';
import { RootComponent } from './root.component';
import { ModuleMapLoaderModule } from '@nguniversal/module-map-ngfactory-loader';
import { BrowserModule } from '@angular/platform-browser';

@NgModule({
  imports: [
    BrowserModule.withServerTransition({ appId: 'univ-base' }),
    RootModule,
    ServerModule,
    ServerTransferStateModule,
    ModuleMapLoaderModule
  ],
  bootstrap: [RootComponent],
})
export class RootServerModule {
}
