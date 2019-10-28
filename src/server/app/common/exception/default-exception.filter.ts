import { Catch, ExceptionFilter, ArgumentsHost } from '@nestjs/common';
import { WinLogger } from '@common/logger/winlogger';


@Catch(Error)
export class DefaultExceptionFilter implements ExceptionFilter {

  private logger = WinLogger.get('unknow-exception');

  catch(exception: Error, host: ArgumentsHost) {

    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();

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
