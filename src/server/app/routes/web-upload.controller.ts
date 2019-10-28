import {
  Controller, Post, Get, Param, UseInterceptors,
  UploadedFile, Body, HttpStatus, HttpCode, UsePipes, Put, Delete
} from '@nestjs/common';
import { ApiUseTags } from '@nestjs/swagger';
import { WebUploadService } from '@services/web-upload.service';
import { Folder } from '@shared/interface/folder.int';
import { CustomValidationPipe } from '@common/validations/custom-validation.pipe';
import { FunctionalException } from '@common/exception/functional.exception';
import { BifrostFileInterceptor } from '@common/interceptors/file.interceptor';

@ApiUseTags('web-upload')
@Controller('web-upload')
export class WebUploadController {

  constructor(private uploadService: WebUploadService) { }

  @Post('folder')
  @HttpCode(HttpStatus.CREATED)
  @UsePipes(CustomValidationPipe)
  createFolder(@Body() folder: Folder): Promise<string> {
    return this.uploadService.createFolder(folder);
  }

  @Get('folder/list')
  uploadInfos(): Folder[] {
    return this.uploadService.listFolders();
  }

  @Get('folder/:reference')
  @UsePipes(CustomValidationPipe)
  getFolder(@Param('reference') reference: string) {
    return this.uploadService.getFolder(reference);
  }

  @Put('folder/:reference')
  @UsePipes(CustomValidationPipe)
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
  uploadFile(@UploadedFile() file: File, @Param('reference') reference: string) {
    return this.uploadService.uploadFile(file, reference);
  }
}
