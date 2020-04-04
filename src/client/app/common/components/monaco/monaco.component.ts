import { Component, OnInit, ViewChild, ElementRef, Input, ChangeDetectionStrategy, forwardRef, NgZone } from '@angular/core';
import { MonacoEditorService } from './monaco.service';
import { DefaultControlValueAccessor } from '@asi-ngtools/lib';
import { Subscription, fromEvent } from 'rxjs';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { UniversalService } from '../../universal/universal.service';

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
  model: any;
  container: HTMLDivElement;
  parseError: boolean;

  private _windowResizeSubscription: Subscription;
  private modelUri: any;

  @ViewChild('editor', { static: true }) editorContent: ElementRef;

  constructor(private monacoEditorService: MonacoEditorService, private universalService: UniversalService, private ngZone: NgZone) {
    super();
  }

  ngOnInit() {
    this.container = this.editorContent.nativeElement;

    if (this.universalService.isClient()) {
      this.monacoEditorService.initMonaco().then((alreadyInit: boolean) => {
          this.initMonaco(alreadyInit);
      });
    }
  }

  ngOnDestroy() {
    if (this._windowResizeSubscription) {
      this._windowResizeSubscription.unsubscribe();
    }
    if (this.editor) {
      this.editor.dispose();
      this.editor = undefined;
    }
  }

  private async initMonaco(_alreadyInit: boolean) {
    if (!this.modelUri) {
      this.modelUri = monaco.Uri.parse('a://b/docker-compose.yml');
    }
    if (!this.model) {
      this.model = monaco.editor.getModel(this.modelUri);
      if (!this.model) {
        this.model = monaco.editor.createModel([this.value].join('\n'), 'yaml', this.modelUri);
      }
    }

    let opts: any = {
      theme: 'vs-dark',
      fontSize: '16px',
      automaticLayout: true,
      scrollBeyondLastLine: false,
      showFoldingControls: 'always',
      minimap: {
        enabled: false
      },
      model: this.model,
    };

    if (this.options) {
      opts = Object.assign({}, opts, this.options);
    }

    this.ngZone.runOutsideAngular(async () => {
      this.editor = monaco.editor.create(this.container, opts);
      this.editor.layout();

      this.editor.onDidChangeModelContent(() => {
        this.value = this.editor.getValue();
      });

      this.editor.onDidChangeModelDecorations(() => {
        if (monaco.editor.getModelMarkers({}).map((m: any) => m.message).join(', ')) {
          this.parseError = true;
        } else {
          this.parseError = false;
        }
      });

      this.editor.onDidBlurEditorText(() => {
        this.onTouched();
      });


      // refresh layout on resize event.
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
