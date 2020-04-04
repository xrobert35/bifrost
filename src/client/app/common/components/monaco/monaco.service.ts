import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class MonacoEditorService {

  private _monacoPath = 'assets/monaco/vs';
  private monacoAlreadyLoaded = false;

  constructor() { }

  public initMonaco() {
    return this.loadMonaco();
  }

  private loadMonaco() {
    return new Promise((resolve) => {
      if (this.monacoAlreadyLoaded) {
        resolve(true);
        return;
      }

      const onGotAmdLoader = () => {
        this.monacoAlreadyLoaded = true;
        // Load monaco
        (<any>window).require.config({ paths: { vs: this._monacoPath, prettier: `${this._monacoPath}/prettier` } });
        (<any>window).require(['vs/editor/editor.main.nls', 'vs/editor/editor.main'], () => {
          this.addAdditionnals().then(() => {
            resolve(false);
          });
        });
      };

      // Load AMD loader if necessary
      if (!(<any>window).require) {
        const loaderScript = document.createElement('script');
        loaderScript.type = 'text/javascript';
        loaderScript.src = `${this._monacoPath}/loader.js`;
        loaderScript.addEventListener('load', onGotAmdLoader);
        document.body.appendChild(loaderScript);
      } else {
        onGotAmdLoader();
      }
    });
  }


  addAdditionnals() {
    return new Promise((resolve) => {
      (<any>window).require([
        'prettier/standalone',
        'prettier/parser-yaml',
      ], () => {

        const monaco = (<any>window).monaco;

        const prettier = require('prettier/standalone');
        const yamlParser = require('prettier/parser-yaml');

        monaco.languages.registerDocumentFormattingEditProvider('yaml', {
          provideDocumentFormattingEdits: function (model: any, options: any, _token: any) {
            const value = model.getValue();
            try {
              const text = value;
              const formatted = prettier.format(text, Object.assign(options, { parser: 'yaml', plugins: [yamlParser] }));
              return [{
                range: model.getFullModelRange(),
                text: formatted
              }];
            } catch (error) {
              return [];
            }
          }
        });
      });

      resolve();
    });
  }
}
