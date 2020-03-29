import { Catch, ExceptionFilter, ArgumentsHost, NotFoundException } from '@nestjs/common';
import { WinLogger } from '@common/logger/winlogger';


@Catch(Error)
export class DefaultExceptionFilter implements ExceptionFilter {

  private logger = WinLogger.get('unknow-exception');

  catch(exception: Error, host: ArgumentsHost) {

    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();

    if (exception instanceof NotFoundException) {
      response
        .status(404)
        .json({
          statusCode: 404,
          timestamp: new Date().toISOString(),
          path: request.url,
          method : request.method,
          libelle: 'Sorry, this endpoint does not exist',
        });
    } else {
      this.logger.error(`An unknow exception occured`, exception);
      response
        .status(500)
        .json({
          statusCode: 500,
          timestamp: new Date().toISOString(),
          path: request.url,
          libelle: 'Sorry, an unknow exception occured',
        });
    }


  }
}
