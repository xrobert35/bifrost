

import { NgModule } from '@angular/core';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { BifrostHttpInterceptor } from './http.interceptor';
import { NgToolsModule } from '../ngtools/ngtools.module';
import { ServerWebService } from '@rest/server.webservice';

const sharedServices = [ServerWebService];

@NgModule({
  imports: [
    HttpClientModule,
    NgToolsModule
  ],
  exports: [
    HttpClientModule
  ],
  providers: [
    ...sharedServices,
    { provide: HTTP_INTERCEPTORS, useClass: BifrostHttpInterceptor, multi: true }
  ],
})
export class RestModule {
}
