import { Component, OnInit, ViewChild, ElementRef, Input, ChangeDetectionStrategy, forwardRef, NgZone } from '@angular/core';
import { MonacoEditorService } from './monaco.service';
import { take, filter } from 'rxjs/operators';
import { DefaultControlValueAccessor } from '@asi-ngtools/lib';
import { Subscription, fromEvent } from 'rxjs';
import { NG_VALUE_ACCESSOR } from '@angular/forms';

declare const monaco: any;

@Component({
  selector: 'monaco-editor',
  templateUrl: './monaco.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => MonacoEditorComponent),
      multi: true
    }
  ]
})
export class MonacoEditorComponent extends DefaultControlValueAccessor implements OnInit {


  @Input() options: any;

  editor: any;
  container: HTMLDivElement;
  parseError: boolean;

  private _windowResizeSubscription: Subscription;

  @ViewChild('editor', { static: true }) editorContent: ElementRef;

  constructor(private monacoEditorService: MonacoEditorService, private ngZone: NgZone) {
    super();
  }

  ngOnInit() {
    this.container = this.editorContent.nativeElement;

    this.monacoEditorService.isMonacoLoaded.pipe(
      filter(isLoaded => isLoaded),
      take(1)
    ).subscribe(() => {
      (<any>window).editor = require('monaco-editor');
      this.initMonaco();
    });
  }

  private async initMonaco() {
    let opts: any = {
      value: [this.value].join('\n'),
      language: 'yaml',
      automaticLayout: true,
      scrollBeyondLastLine: false,
      minimap: {
        enabled: false
      }
    };

    if (this.options) {
      opts = Object.assign({}, opts, this.options);
    }


    this.ngZone.runOutsideAngular(async () => {
      this.editor = monaco.editor.create(this.container, opts);
      this.editor.layout();

      monaco.editor.defineTheme('monokai', await this.monacoEditorService.getTheme());
      monaco.editor.setTheme('monokai');

      this.editor.onDidChangeModelContent(() => {
        this.value = this.editor.getValue();
      });

      this.editor.onDidChangeModelDecorations(() => {
        const pastParseError = this.parseError;

        if (monaco.editor.getModelMarkers({}).map((m: any) => m.message).join(', ')) {
          this.parseError = true;
        } else {
          this.parseError = false;
        }

        if (pastParseError !== this.parseError) {
          // this.onErrorStatusChange();
        }
      });

      this.editor.onDidBlurEditorText(() => {
        this.onTouched();
      });


      //efsh layout on resize event.
      if (this._windowResizeSubscription) {
        this._windowResizeSubscription.unsubscribe();
      }
      this._windowResizeSubscription = fromEvent(window, 'resize').subscribe(() => {
        this.editor.layout({
          width: this.container.offsetWidth,
          height: this.container.offsetHeight
        });
      });
    });
  }

  writeValue(value: string): void {
    this.value = value;
    if (this.editor && value) {
      this.editor.setValue(value);
    } else if (this.editor) {
      this.editor.setValue('');
    }
  }
}
