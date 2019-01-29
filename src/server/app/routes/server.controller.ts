import { Controller, Post, Body, HttpStatus, HttpCode, Get, UsePipes, Param, Delete } from '@nestjs/common';
import { ApiUseTags } from '@nestjs/swagger';
import { CustomValidationPipe } from '@common/validations/custom-validation.pipe';
import { ServerService } from '@services/server.service';
import { DockerService } from '@services/docker.service';
import { Server } from '@shared/interface/server.int';
import * as Bluebird from 'bluebird';
import { DockerContainer } from '@shared/interface/container.int';

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
      const data = <DockerContainer>container.data;
      const imageFullName = await this.dockerService.getImageName(data.ImageID);
      if (imageFullName.indexOf('@') !== -1) {
        data.Image = imageFullName.split('@')[0];
        data.ImageDigestId = imageFullName.split('@')[1];
      } else {
        data.Image = imageFullName;
      }
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

  @Delete('container/:containerId')
  @HttpCode(HttpStatus.OK)
  @UsePipes(new CustomValidationPipe())
  async deleteContainer(@Param('containerId') containerId: string) {
    await this.dockerService.deleteContainer(containerId);
  }

  @Post('container/:containerId/start')
  @HttpCode(HttpStatus.OK)
  @UsePipes(new CustomValidationPipe())
  async startContainer(@Param('containerId') containerId: string) {
    await this.dockerService.startContainer(containerId);
  }

  @Post('container/:containerId/update')
  @HttpCode(HttpStatus.OK)
  @UsePipes(new CustomValidationPipe())
  async updateContainer(@Param('containerId') containerId: string, @Body() info: any) {
    return await this.dockerService.updateContainer(containerId, info);
  }

  @Post('/prune')
  @HttpCode(HttpStatus.OK)
  @UsePipes(new CustomValidationPipe())
  prune() {
    return this.dockerService.prune();
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
