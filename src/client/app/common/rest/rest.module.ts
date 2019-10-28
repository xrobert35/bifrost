

import { NgModule } from '@angular/core';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { BifrostHttpInterceptor } from './http.interceptor';
import { NgToolsModule } from '../ngtools/ngtools.module';
import { ServerWebService } from '@rest/server.webservice';
import { DockerWebService } from '@rest//docker.webservice';
import { TaskWebService } from '@rest//task.webservice';
import { ComposeWebService } from '@rest//compose.webservice';
import { WebUploadWebService } from './web-upload.webservice';
import { WebSocketClient } from './ws/websocket.client';
import { TailLogComponent } from '../components/tail-log/tail-log.component';
import { BifrostWebService } from './bifrost.webservice';

const sharedServices = [ServerWebService,
  DockerWebService,
  TaskWebService,
  ComposeWebService,
  WebUploadWebService,
  BifrostWebService,
  WebSocketClient];

const sharedComponents = [TailLogComponent];

@NgModule({
  declarations: [...sharedComponents],
  imports: [
    HttpClientModule,
    NgToolsModule
  ],
  exports: [
    HttpClientModule,
    ...sharedComponents
  ],
  providers: [
    ...sharedServices,
    { provide: HTTP_INTERCEPTORS, useClass: BifrostHttpInterceptor, multi: true }
  ],
})
export class RestModule {
}
