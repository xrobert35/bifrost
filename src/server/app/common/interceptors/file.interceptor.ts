import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import * as multer from 'multer';
import { Config } from '@config/config';
import * as fs from 'fs';
import { WinLogger } from '@common/logger/winlogger';
import * as urlJoin from 'url-join';

@Injectable()
export class BifrostFileInterceptor implements NestInterceptor {

  private logger = WinLogger.get('file-interceptor');
  uploadTmpFolder = Config.get().UPLOAD_TMP_FOLDER;

  constructor() {
    if (!fs.existsSync(this.uploadTmpFolder)) {
      fs.mkdirSync(this.uploadTmpFolder, { recursive: true });
    }
  }

  intercept(context: ExecutionContext, next: CallHandler) {
    const fileInterceptor = FileInterceptor('file', {
      storage: multer.diskStorage({
        destination: (_req, _file, cb) => {
          cb(null, this.uploadTmpFolder);
        },
        filename: (req: any, file, cb) => {
          req.context = req.context || {};
          const fileName = file.fieldname + '-' + Date.now();
          req.context.uploading = urlJoin(this.uploadTmpFolder, fileName);
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
