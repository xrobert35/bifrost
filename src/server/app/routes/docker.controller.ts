import { Controller, Post, Body, HttpStatus, HttpCode, Get, UsePipes, Param, Delete, Query } from '@nestjs/common';
import { ApiUseTags } from '@nestjs/swagger';
import { CustomValidationPipe } from '@common/validations/custom-validation.pipe';
import { DockerService } from '@services/docker.service';

@ApiUseTags('docker')
@Controller('docker')
export class DockerController {

  constructor(private dockerService: DockerService) { }

  @Get('containers')
  @HttpCode(HttpStatus.OK)
  public async containers(@Query('stack') stack: string) {
    return this.dockerService.list(stack);
  }

  @Get('container/:containerId')
  @HttpCode(HttpStatus.OK)
  async getContainer(@Param('containerId') containerId: string) {
    return this.dockerService.getContainer(containerId);
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
