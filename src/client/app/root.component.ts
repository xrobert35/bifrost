import { Component, ViewContainerRef } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './root.component.html'
})
export class RootComponent {
  title = 'app';

  constructor(public viewContainerRef: ViewContainerRef) {}
}
