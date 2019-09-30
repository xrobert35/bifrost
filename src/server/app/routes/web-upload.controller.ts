import {
  Controller, Post, Get, Param, UseInterceptors, FileInterceptor,
  UploadedFile, Body, HttpStatus, HttpCode, UsePipes, Put, Delete
} from '@nestjs/common';
import { ApiUseTags } from '@nestjs/swagger';
import { WebUploadService } from '@services/web-upload.service';
import { Folder } from '@shared/interface/folder.int';
import { CustomValidationPipe } from '@common/validations/custom-validation.pipe';
import { FunctionalException } from '@common/exception/functional.exception';

@ApiUseTags('web-upload')
@Controller('web-upload')
export class WebUploadController {

  constructor(private uploadService: WebUploadService) { }

  @Post('folder')
  @HttpCode(HttpStatus.CREATED)
  @UsePipes(CustomValidationPipe)
  createFolder(@Body() folder: Folder): string {
    return this.uploadService.createFolder(folder);
  }

  @Put('folder/:reference')
  @UsePipes(CustomValidationPipe)
  updateFolder(@Param('reference') reference: string, @Body() folder: Folder): string {
    if (reference !== folder.reference) {
      throw new FunctionalException('bad-folder-reference', 'Body and path param reference should be equals');
    }
    return this.uploadService.createFolder(folder);
  }

  @Delete('folder/:reference')
  deleteFolder(@Param('reference') reference: string) {
    this.uploadService.deleteFolder(reference);
  }

  @Get('folder/list')
  uploadInfos(): Folder[] {
    return this.uploadService.listFolders();
  }

  @Post('upload/:reference')
  @UseInterceptors(FileInterceptor('file'))
  uploadFile(@UploadedFile() file: File, @Param('reference') reference: string): void {
    this.uploadService.uploadFile(file, reference);
  }
}
