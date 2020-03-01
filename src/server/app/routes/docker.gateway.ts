
import {
  SubscribeMessage,
  WebSocketGateway,
  OnGatewayConnection,
} from '@nestjs/websockets';
import { WinLogger } from '@common/logger/winlogger';
import { DockerService } from '@services/docker.service';
import { Socket } from 'net';

@WebSocketGateway(4081, { namespace: 'dockerlogs' })
export class DockerGateway implements OnGatewayConnection {

  private logger = WinLogger.get('docker-service');

  constructor(private dockerService: DockerService) {
    this.logger.info('Docket gateway loaded');
  }

  handleConnection(_client: any, ..._args: any[]) {
    this.logger.info('New client socket');
  }

  @SubscribeMessage('getlog')
  handleEvent(socket: Socket, socketData: any): string {
    this.dockerService.streamLog(socketData.containerId, 100).subscribe( (logs) => {
      socket.emit('asynclog', logs);
    });
    return 'ok';
  }

}
