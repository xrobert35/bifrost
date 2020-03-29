
import {
  SubscribeMessage,
  WebSocketGateway,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { WinLogger } from '@common/logger/winlogger';
import { DockerService } from '@services/docker.service';
import { Socket } from 'net';
import { Subscription } from 'rxjs';
import { ServerService } from '@services/server.service';

@WebSocketGateway(4081, { namespace: 'logs' })
export class LogGateway implements OnGatewayConnection, OnGatewayDisconnect {

  private logger = WinLogger.get('docker-gateway');

  private clients: { subscriptions: { [name: string]: Subscription }, socket: Socket }[] = [];

  constructor(private dockerService: DockerService, private serverService: ServerService) {
    this.logger.info('Docket gateway loaded');
  }

  handleDisconnect(socket: Socket) {
    this.logger.info(`Client disconnection ${(socket as any).id}`);
    const clientInfo = this.getClientFromSocket(socket);
    Object.values(clientInfo.subscriptions).forEach(sub => sub.unsubscribe());
    this.clients = this.clients.filter((client) => client.socket !== socket);
  }

  handleConnection(socket: Socket, ..._args: any[]) {
    this.logger.info(`Client connected ${(socket as any).id}`);
    this.clients.push({
      socket: socket,
      subscriptions: {}
    });
  }

  @SubscribeMessage('getlogs')
  handleEvent(socket: Socket, socketData: { logType: string, logId: string, logLength: number }): string {
    const clientInfo = this.getClientFromSocket(socket);

    if (clientInfo.subscriptions[socketData.logType]) {
      clientInfo.subscriptions[socketData.logType].unsubscribe();
    }

    let subscription;
    switch (socketData.logType) {
      case 'docker':
        subscription = this.dockerService.streamLog(socketData.logId, socketData.logLength || 100).subscribe((logs) => {
          socket.emit(`asynclog/${socketData.logType}/${socketData.logId}`, logs);
        });
        break;
      case 'nginx':
        subscription = this.serverService.streamLog(socketData.logId + '.log', socketData.logLength || 100).subscribe((logs) => {
          socket.emit(`asynclog/${socketData.logType}/${socketData.logId}`, logs);
        });
        break;
    }

    if (subscription) {
      clientInfo.subscriptions[socketData.logType] = subscription;
    }
    return 'ok';
  }

  private getClientFromSocket(socket: Socket) {
    return this.clients.find((aClient) => aClient.socket === socket);
  }

}
