import { Controller, Post, Body, HttpStatus, HttpCode, Get, UsePipes } from '@nestjs/common';
import { ApiUseTags } from '@nestjs/swagger';
import { CustomValidationPipe } from '@common/validations/custom-validation.pipe';
import { ServerService } from '@services/server.service';
import { DockerService } from '@services/docker.service';
import { Server } from '@shared/interface/server.int';

@ApiUseTags('server')
@Controller('server')
export class ServerController {

  constructor(private serverService: ServerService,
    private dockerService: DockerService) { }


  @Get('containers')
  @HttpCode(HttpStatus.OK)
  @UsePipes(new CustomValidationPipe())
  public async containers() {
    const containers = await this.dockerService.list();
    return containers;
  }

  @Get('')
  @HttpCode(HttpStatus.OK)
  @UsePipes(new CustomValidationPipe())
  public async get(): Promise<Server> {
    const newServer = await this.serverService.get();
    return newServer;
  }

  @Post('')
  @HttpCode(HttpStatus.CREATED)
  @UsePipes(new CustomValidationPipe())
  public async create(@Body() server: Server): Promise<Server> {
    const newServer = await this.serverService.create(server);
    return newServer;
  }
}
