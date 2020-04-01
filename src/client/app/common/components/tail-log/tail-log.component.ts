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
  logType: string;

  @Input()
  logId: string;

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

      this.socket = this.webSocketClient.open('logs');

      this.askForLogs();

      this.receiveLogSub = this.webSocketClient.onEvent(this.socket, `asynclog/${this.logType}/${this.logId}`).subscribe((msg) => {
        this.originalLogs.push(msg);
        this.displayLogs.push(this.toDisplayLog(msg));
        const logsContainerDiv = this.logsContainer.nativeElement;
        if (this.firstLoad || (logsContainerDiv.offsetHeight  + logsContainerDiv.scrollTop) === logsContainerDiv.scrollHeight) {
          this.firstLoad = false;
          setTimeout(() => {
            this.getBottom();
          });
        }
      });
    }
  }

  private askForLogs() {
    this.originalLogs = [];
    this.displayLogs = [];

    const dataWithLength = { logType: this.logType, logId: this.logId, logLength: this.logLength };
    this.webSocketClient.emit(this.socket, 'getlogs', dataWithLength);
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
    this.logLength += 500;
    this.askForLogs();
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
