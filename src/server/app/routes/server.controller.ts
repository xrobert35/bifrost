import { ApiUseTags } from '@nestjs/swagger';
import { Controller, Get, HttpCode, UsePipes, HttpStatus, Post, Put, Delete, Body, Param } from '@nestjs/common';
import { CustomValidationPipe } from '@common/validations/custom-validation.pipe';
import { ServerLocation } from '@shared/interface/serverLocation.int';
import { ServerService } from '@services/server.service';
import { Server } from '@shared/interface/server.int';

@ApiUseTags('server')
@Controller('server')
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
  @UsePipes(CustomValidationPipe)
  public async addProxy(@Body() proxy: ServerLocation): Promise<string> {
    return this.serverService.addProxy(proxy);
  }

  @Put('/proxy/:reference')
  @HttpCode(HttpStatus.OK)
  @UsePipes(CustomValidationPipe)
  public async editProxy(@Body() proxy: ServerLocation): Promise<string> {
    return this.serverService.editProxy(proxy);
  }

  @Delete('/proxy/:reference')
  @HttpCode(HttpStatus.OK)
  @UsePipes(CustomValidationPipe)
  public async deleteProxy(@Param('reference') reference: string): Promise<void> {
    this.serverService.deleteProxy(reference);
  }

}
