import { Input, Component, SimpleChanges, OnChanges, OnDestroy, ElementRef, ViewChild } from '@angular/core';
import { WebSocketClient } from '@rest/ws/websocket.client';
import { Subscription } from 'rxjs';
import { UniversalService } from '../../universal/universal.service';

@Component({
  selector: 'tail-log',
  templateUrl: './tail-log.component.html'
})
export class TailLogComponent implements OnChanges, OnDestroy {

  @Input()
  containerId: string;

  displayLogs: string[] = [];
  originalLogs: string[] = [];

  logLength = 100;
  firstLoad = true;

  showTimeStamp = true;

  @ViewChild('logsContainer', { static: false }) logsContainer: ElementRef<HTMLDivElement>;

  private socket: SocketIOClient.Socket;
  private receiveLogSub: Subscription;

  constructor(private webSocketClient: WebSocketClient, private universalService: UniversalService) { }

  ngOnChanges(_simpleChange: SimpleChanges) {
    this.displayLogs = [];
    this.originalLogs = [];

    if (this.universalService.isClient()) {

      this.socket = this.webSocketClient.open('dockerlogs');
      this.webSocketClient.emit(this.socket, 'getlogs', { containerId: this.containerId, logLength: this.logLength });

      this.receiveLogSub = this.webSocketClient.onEvent(this.socket, `asynclog/${this.containerId}`).subscribe((msg) => {
        this.originalLogs.push(msg);
        this.displayLogs.push(this.toDisplayLog(msg));
        if (this.firstLoad || this.logsContainer.nativeElement.scrollTop === this.logsContainer.nativeElement.scrollHeight) {
          this.firstLoad = false;
          setTimeout(() => {
            this.getBottom();
          });
        }
      });
    }
  }

  private toDisplayLog(originalLog: string) {
    if (!this.showTimeStamp) {
      return originalLog.substring(31);
    }
    return originalLog;
  }

  showTimeStampChanged() {
    this.displayLogs = this.originalLogs.map((log) => this.toDisplayLog(log));
  }

  plusHundred() {
    this.originalLogs = [];
    this.displayLogs = [];

    this.logLength += 100;
    this.webSocketClient.emit(this.socket, 'getlogs', { containerId: this.containerId, logLength: this.logLength });
  }

  getBottom() {
    this.logsContainer.nativeElement.scrollTop = this.logsContainer.nativeElement.scrollHeight;
  }

  ngOnDestroy() {
    if (this.receiveLogSub) {
      this.receiveLogSub.unsubscribe();
    }
    if (this.socket) {
      this.socket.disconnect();
    }
  }
}
