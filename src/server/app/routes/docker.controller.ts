import { Controller, Post, Body, HttpStatus, HttpCode, Get, UsePipes, Param, Delete, Query } from '@nestjs/common';
import { ApiUseTags } from '@nestjs/swagger';
import { ValidationPipe } from '@common/validations/custom-validation.pipe';
import { DockerService } from '@services/docker.service';
import { Role } from '@common/security/model/role.enum';
import { Roles } from '@common/security/guard/role.decorator';

@ApiUseTags('docker')
@Controller('docker')
@Roles(Role.ADMIN, Role.DOCKER_ACCESS)
@UsePipes(ValidationPipe)
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
  async stopContainer(@Param('containerId') containerId: string) {
    await this.dockerService.stopContainer(containerId);
  }

  @Delete('container/:containerId')
  @HttpCode(HttpStatus.OK)
  async deleteContainer(@Param('containerId') containerId: string) {
    await this.dockerService.deleteContainer(containerId);
  }

  @Post('container/:containerId/start')
  @HttpCode(HttpStatus.OK)
  async startContainer(@Param('containerId') containerId: string) {
    await this.dockerService.startContainer(containerId);
  }

  @Post('container/:containerId/update')
  @HttpCode(HttpStatus.OK)
  async updateContainer(@Param('containerId') containerId: string, @Body() info: any) {
    return await this.dockerService.updateContainer(containerId, info);
  }

  @Post('/prune')
  @HttpCode(HttpStatus.OK)
  prune() {
    return this.dockerService.prune();
  }
}
