import {
  UsePipes, Controller, Get
} from '@nestjs/common';
import { ValidationPipe } from '@common/validations/custom-validation.pipe';
import { ApiUseTags } from '@nestjs/swagger';
import { Config } from '@config/config';

@ApiUseTags('bifrost')
@Controller('bifrost')
@UsePipes(ValidationPipe)
export class BifrostController {

  @Get('/config')

  getConfig() {
    const defaultComposeFolder = Config.get().DEFAULT_COMPOSE_FOLDER;
    const packageJson = require('../../../../package.json');
    return {
      version : packageJson.version,
      defaultComposeFolder: defaultComposeFolder
    };
  }
}
