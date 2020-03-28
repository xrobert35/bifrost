
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

@WebSocketGateway(4081, { namespace: 'dockerlogs' })
export class DockerGateway implements OnGatewayConnection, OnGatewayDisconnect {

  private logger = WinLogger.get('docker-gateway');

  private clients: { subscriptions: {[name: string]: Subscription}, socket: Socket }[] = [];

  constructor(private dockerService: DockerService) {
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
  handleEvent(socket: Socket, socketData: any): string {
    const clientInfo = this.getClientFromSocket(socket);

    if (clientInfo.subscriptions.getLogs) {
      clientInfo.subscriptions.getLogs.unsubscribe();
    }

    const subscription = this.dockerService.streamLog(socketData.containerId, socketData.logLength || 100).subscribe((logs) => {
      socket.emit(`asynclog/${socketData.containerId}`, logs);
    });
    clientInfo.subscriptions.getLogs = subscription;
    return 'ok';
  }

  private getClientFromSocket(socket: Socket) {
    return this.clients.find((aClient) => aClient.socket === socket);
  }

}
