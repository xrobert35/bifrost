import { ApiUseTags } from '@nestjs/swagger';
import { Controller, Get, HttpCode, UsePipes, HttpStatus, Post, Put, Delete, Body, Param, ValidationPipe } from '@nestjs/common';
import { ServerLocation } from '@shared/interface/serverLocation.int';
import { ServerService } from '@services/server.service';
import { Server } from '@shared/interface/server.int';
import { Roles } from '@common/security/guard/role.decorator';
import { Role } from '@common/security/model/role.enum';

@ApiUseTags('server')
@Controller('server')
@Roles(Role.ADMIN, Role.PROXY_ACCESS)
@UsePipes(ValidationPipe)
export class ServerController {

  constructor(private serverService: ServerService) {
  }

  @Get('')
  @HttpCode(HttpStatus.OK)
  public get(): Server {
    return this.serverService.get();
  }

  @Post('/proxy')
  @HttpCode(HttpStatus.CREATED)
  public async addProxy(@Body() proxy: ServerLocation): Promise<string> {
    return this.serverService.addProxy(proxy);
  }

  @Put('/proxy/:reference')
  @HttpCode(HttpStatus.OK)
  public async editProxy(@Body() proxy: ServerLocation): Promise<string> {
    return this.serverService.editProxy(proxy);
  }

  @Delete('/proxy/:reference')
  @HttpCode(HttpStatus.OK)
  public async deleteProxy(@Param('reference') reference: string): Promise<void> {
    this.serverService.deleteProxy(reference);
  }

  @Post('/reload')
  @HttpCode(HttpStatus.OK)
  public readlogProxyConfig() {
    return this.serverService.writeAndReloadNginxConf().toPromise();
  }
}
