import { Controller, Post, Body, HttpStatus, HttpCode, Get, UsePipes, Param, Delete, Query } from '@nestjs/common';
import { ApiUseTags } from '@nestjs/swagger';
import { CustomValidationPipe } from '@common/validations/custom-validation.pipe';
import { DockerService } from '@services/docker.service';
import Bluebird = require('bluebird');
import { DockerContainer } from '@shared/interface/container.int';

@ApiUseTags('docker')
@Controller('docker')
export class DockerController {

  constructor(private dockerService: DockerService) { }

  @Get('containers')
  @HttpCode(HttpStatus.OK)
  public async containers(@Query('stack') stack: string) {
    const containers = await this.dockerService.list(stack);
    const datas = await Bluebird.mapSeries(containers, async (container) => {
      const data = <DockerContainer>container.data;
      const imageFullName = await this.dockerService.getImageName(data.ImageID);
      if (imageFullName.indexOf('@') !== -1) {
        data.Image = imageFullName.split('@')[0];
        data.ImageDigestId = imageFullName.split('@')[1];
      } else {
        data.Image = imageFullName;
      }
      data.stack = data.Labels['com.docker.compose.project'];
      return data;
    });
    return datas;
  }

  @Post('container/:containerId/stop')
  @HttpCode(HttpStatus.OK)
  @UsePipes(CustomValidationPipe)
  async stopContainer(@Param('containerId') containerId: string) {
    await this.dockerService.stopContainer(containerId);
  }

  @Delete('container/:containerId')
  @HttpCode(HttpStatus.OK)
  @UsePipes(CustomValidationPipe)
  async deleteContainer(@Param('containerId') containerId: string) {
    await this.dockerService.deleteContainer(containerId);
  }

  @Post('container/:containerId/start')
  @HttpCode(HttpStatus.OK)
  @UsePipes(CustomValidationPipe)
  async startContainer(@Param('containerId') containerId: string) {
    await this.dockerService.startContainer(containerId);
  }

  @Post('container/:containerId/update')
  @HttpCode(HttpStatus.OK)
  @UsePipes(CustomValidationPipe)
  async updateContainer(@Param('containerId') containerId: string, @Body() info: any) {
    return await this.dockerService.updateContainer(containerId, info);
  }

  @Post('/prune')
  @HttpCode(HttpStatus.OK)
  @UsePipes(CustomValidationPipe)
  prune() {
    return this.dockerService.prune();
  }
}
