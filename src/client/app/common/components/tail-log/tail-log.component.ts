import { Input, Component, SimpleChanges, OnChanges, OnDestroy } from '@angular/core';
import { WebSocketClient } from '@rest/ws/websocket.client';
import { Subscription } from 'rxjs';

@Component({
  selector: 'tail-log',
  templateUrl: './tail-log.component.html'
  // changeDetection: ChangeDetectionStrategy.OnPush
})
export class TailLogComponent implements OnChanges, OnDestroy {

  @Input()
  containerId: string;

  logs: Array<string> = [];

  private socketSubscription: Subscription;

  constructor(private webSocketClient: WebSocketClient) {
  }

  ngOnChanges(_simpleChange: SimpleChanges) {
    this.logs = [];
    if (this.socketSubscription) {
      this.socketSubscription.unsubscribe();
    }
    this.socketSubscription = this.webSocketClient.open('ws://localhost:4081/events', this.containerId).subscribe((msg) => {
      msg = msg.replace(/\u0000/g , ' ');
      msg = msg.replace(/\u0001/g , ' ');
      msg = msg.replace(/\u0002/g , ' ');
      this.logs.push(msg);
    });
  }

  ngOnInit() {
    console.log(this.logs);
  }

  ngOnDestroy() {
    if (this.socketSubscription) {
      this.socketSubscription.unsubscribe();
    }
  }

}