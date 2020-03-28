import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { WinLogger } from '@common/logger/winlogger';
import fs = require('fs');
import urlJoin = require('url-join');
import multer = require('multer');
import { WebUploadService } from '@services/web-upload.service';

@Injectable()
export class BifrostFileInterceptor implements NestInterceptor {

  private logger = WinLogger.get('file-interceptor');

  constructor(private webUploadService: WebUploadService) {
  }

  async intercept(context: ExecutionContext, next: CallHandler) {
    const req = context.switchToHttp().getRequest();
    const folder = await this.webUploadService.getFolder(req.params.reference);

    const fileInterceptor = FileInterceptor('file', {
      storage: multer.diskStorage({
        destination: (_req, _file, cb) => {
          cb(null, folder.path);
        },
        filename: (_req: any, file, cb) => {
          _req.context = _req.context || {};
          const fileName = file.fieldname + '-' + Date.now();
          req.context.uploading = urlJoin(folder.path, fileName);
          cb(null, fileName);
        },
      })
    });

    const httpReq = context.switchToHttp().getRequest();
    httpReq.on('close', async () => {
      this.logger.debug('Request closed while upload file ' + httpReq.baseUrl);
      if (httpReq.context && httpReq.context.uploading) {
        fs.exists(httpReq.context.uploading, exists => {
          if (exists) {
            fs.promises.unlink(httpReq.context.uploading);
          }
        });
      }
    });

    const fileintercep = new fileInterceptor();
    return fileintercep.intercept(context, next);
  }

}
