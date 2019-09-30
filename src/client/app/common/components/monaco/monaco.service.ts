import { Injectable, NgZone } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { UniversalService } from '../../universal/universal.service';

@Injectable({ providedIn: 'root' })
export class MonacoEditorService {

  nodeRequire: any;

  isMonacoLoaded: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  private _monacoPath = 'assets/monaco-editor/vs';
  private _monacoThemesPath = 'assets/monaco-themes/';

  private theme: any;

  set monacoPath(value: any) {
    if (value) {
      this._monacoPath = value;
    }
  }

  constructor(ngZone: NgZone, private httpClient: HttpClient, universalService: UniversalService) {

    if (universalService.isClient()) {

      const onGotAmdLoader = () => {
        if ((<any>window).monacoEditorAlreadyInitialized) {
          ngZone.run(() => this.isMonacoLoaded.next(true));
          return;
        }

        (<any>window).monacoEditorAlreadyInitialized = true;

        // Load monaco
        (<any>window).amdRequire = (<any>window).require;
        if (this.nodeRequire) {
          (<any>window).require = this.nodeRequire;
        }
        (<any>window).amdRequire.config({ paths: { 'vs': this._monacoPath } });
        (<any>window).amdRequire(['vs/editor/editor.main'], () => {
          ngZone.run(() => this.isMonacoLoaded.next(true));
        });
      };

      let loaderScript: any = null;
      // Load AMD loader if necessary
      if (!(<any>window).require && !(<any>window).amdRequire) {

        loaderScript = document.createElement('script');
        loaderScript.type = 'text/javascript';
        loaderScript.src = `${this._monacoPath}/loader.js`;
        loaderScript.addEventListener('load', onGotAmdLoader);
        document.body.appendChild(loaderScript);

      } else if (!(<any>window).amdRequire) {

        this.addElectronFixScripts();

        this.nodeRequire = (<any>window).require;
        loaderScript = document.createElement('script');
        loaderScript.type = 'text/javascript';
        loaderScript.src = `${this._monacoPath}/loader.js`;
        loaderScript.addEventListener('load', onGotAmdLoader);
        document.body.appendChild(loaderScript);

      } else {
        onGotAmdLoader();
      }
    }
  }

  async getTheme() {
    if (this.theme) {
      return this.theme;
    } else {
      this.theme = await this.httpClient.get(this._monacoThemesPath + 'Monokai.json').toPromise();
      return this.theme;
    }
  }

  addElectronFixScripts() {
    const electronFixScript = document.createElement('script');
    // workaround monaco-css not understanding the environment
    const inlineScript = document.createTextNode('self.module = undefined;');
    // workaround monaco-typescript not understanding the environment
    const inlineScript2 = document.createTextNode('self.process.browser = true;');
    electronFixScript.appendChild(inlineScript);
    electronFixScript.appendChild(inlineScript2);
    document.body.appendChild(electronFixScript);
  }
}
