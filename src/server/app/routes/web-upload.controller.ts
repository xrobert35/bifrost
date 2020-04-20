import {
  Controller, Post, Get, Param, UseInterceptors,
  UploadedFile, Body, HttpStatus, HttpCode, UsePipes, Put, Delete, ValidationPipe
} from '@nestjs/common';
import { ApiUseTags } from '@nestjs/swagger';
import { WebUploadService } from '@services/web-upload.service';
import { Folder } from '@shared/interface/folder.int';
import { FunctionalException } from '@common/exception/functional.exception';
import { BifrostFileInterceptor } from '@common/interceptors/file.interceptor';
import { Roles } from '@common/security/guard/role.decorator';
import { Role } from '@common/security/model/role.enum';

@ApiUseTags('web-upload')
@Controller('web-upload')
@Roles(Role.ADMIN, Role.DOCKER_ACCESS)
@UsePipes(ValidationPipe)
export class WebUploadController {

  constructor(private uploadService: WebUploadService) { }

  @Post('folder')
  @HttpCode(HttpStatus.CREATED)
  createFolder(@Body() folder: Folder): Promise<string> {
    return this.uploadService.createFolder(folder);
  }

  @Get('folder/list')
  uploadInfos(): Folder[] {
    return this.uploadService.listFolders();
  }

  @Get('folder/:reference')
  getFolder(@Param('reference') reference: string) {
    return this.uploadService.getFileList(reference);
  }

  @Put('folder/:reference')
  updateFolder(@Param('reference') reference: string, @Body() folder: Folder): Promise<string> {
    if (reference !== folder.reference) {
      throw new FunctionalException('bad-folder-reference', 'Body and path param reference should be equals');
    }
    return this.uploadService.updateFolder(folder);
  }

  @Delete('folder/:reference')
  deleteFolder(@Param('reference') reference: string) {
    return this.uploadService.deleteFolder(reference);
  }

  @Post('upload/:reference')
  @UseInterceptors(BifrostFileInterceptor)
  uploadFile(@UploadedFile() file: any, @Param('reference') reference: string) {
    return this.uploadService.uploadFile(file, reference);
  }
}
