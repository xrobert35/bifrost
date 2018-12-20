import { TranslateLoader } from '@ngx-translate/core';
import { Observable } from 'rxjs';
import * as fs from 'fs';

import { makeStateKey, StateKey, TransferState } from '@angular/platform-browser';
import { HttpClient } from '@angular/common/http';
import { UniversalService } from './universal.service';

const key: StateKey<number> = makeStateKey<number>('transfer-translate');

export class TranslateUniversalLoader implements TranslateLoader {

  constructor(private transferState: TransferState, private universalService: UniversalService, private httpClient: HttpClient) {}

  public getTranslation(lang: string): Observable<any> {
    return Observable.create((observer: any) => {
      if (this.universalService.isServer()) {
        const json = JSON.parse(fs.readFileSync(`${this.universalService.getRootFolder()}/assets/i18n/${lang}.json`, 'utf8'));
        this.transferState.set(key, json);
        observer.next(this.transferState.get(key, null));
        observer.complete();
      } else if (!this.transferState.hasKey(key)) {
        this.httpClient.get(`assets/i18n/${lang}.json`).subscribe((json) => {
          this.transferState.set(key, json);
          observer.next(this.transferState.get(key, null));
          observer.complete();
        });
      } else {
        observer.next(this.transferState.get(key, null));
        observer.complete();
      }
    });
  }
}
