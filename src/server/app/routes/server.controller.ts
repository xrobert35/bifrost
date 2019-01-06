import { Controller, Post, Body, HttpStatus, HttpCode, Get, UsePipes, Param } from '@nestjs/common';
import { ApiUseTags } from '@nestjs/swagger';
import { CustomValidationPipe } from '@common/validations/custom-validation.pipe';
import { ServerService } from '@services/server.service';
import { DockerService } from '@services/docker.service';
import { Server } from '@shared/interface/server.int';
import * as Bluebird from 'bluebird';

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
    const datas = await Bluebird.mapSeries(containers, async (container) => {
      const data = <any>container.data;
      data.Image = await this.dockerService.getImageName(data.ImageID);
      return data;
    });
    return datas;
  }

  @Post('container/:containerId/stop')
  @HttpCode(HttpStatus.OK)
  @UsePipes(new CustomValidationPipe())
  async stopContainer(@Param('containerId') containerId: string) {
    await this.dockerService.stopContainer(containerId);
  }

  @Post('container/:containerId/start')
  @HttpCode(HttpStatus.OK)
  @UsePipes(new CustomValidationPipe())
  async startContainer(@Param('containerId') containerId: string) {
    await this.dockerService.startContainer(containerId);
  }

  @Post('container/:containerId/recreate')
  @HttpCode(HttpStatus.OK)
  @UsePipes(new CustomValidationPipe())
  async recreateContainer(@Param('containerId') containerId: string, @Body() info: any) {
    await this.dockerService.recreateContainer(containerId, info);
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
