import {
  UsePipes, Controller, Get
} from '@nestjs/common';
import { CustomValidationPipe } from '@common/validations/custom-validation.pipe';
import { ApiUseTags } from '@nestjs/swagger';
import { Config } from '@config/config';

@ApiUseTags('bifrost')
@Controller('bifrost')
export class BifrostController {

  @Get('/config')
  @UsePipes(CustomValidationPipe)
  getConfig() {
    const defaultComposeFolder = Config.get().DEFAULT_COMPOSE_FOLDER;
    return {
      defaultComposeFolder: defaultComposeFolder
    };
  }
}
