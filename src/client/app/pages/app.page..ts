import { Component, HostBinding } from '@angular/core';

@Component({
  selector: 'app-page',
  templateUrl: './app.page.html'
})
export class AppPage {

  @HostBinding('class') class = 'flex-column';

  constructor() {}
}
