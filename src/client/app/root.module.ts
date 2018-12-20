import { TransferState } from '@angular/platform-browser';
import { NgModule, ErrorHandler } from '@angular/core';
import { RootComponent } from './root.component';
import { UnivCommonModule } from './common/univ-common.module';
import { TranslateModule } from '@ngx-translate/core';
import { TranslateLoader } from '@ngx-translate/core';
import { HttpClient } from '@angular/common/http';
import { TranslateService } from '@ngx-translate/core';
import { UnivErrorHandler } from './common/error.handler';
import { AppRoutingModule } from './pages/app.router';
import { UniversalService } from './common/universal/universal.service';
import { TranslateUniversalLoader } from './common/universal/universal.loader';

const translateLoader = (transferState: TransferState, universalService: UniversalService, httpClient: HttpClient) => {
  return new TranslateUniversalLoader(transferState, universalService, httpClient);
};


@NgModule({
  declarations: [
    RootComponent
  ],
  imports: [
    AppRoutingModule,
    UnivCommonModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: translateLoader,
        deps: [TransferState, UniversalService, HttpClient]
      }
    }),
  ],
  providers: [{ provide: ErrorHandler, useClass: UnivErrorHandler }]
})
export class RootModule {
  constructor(translate: TranslateService) {
    translate.setDefaultLang('fr');
    translate.use('fr');
  }
}
