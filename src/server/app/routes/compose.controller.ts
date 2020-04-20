import {
  Post, HttpCode, UsePipes, HttpStatus, Body, Controller, Get, Param, Put, Delete, ValidationPipe
} from '@nestjs/common';
import { ApiUseTags } from '@nestjs/swagger';
import { FunctionalException } from '@common/exception/functional.exception';
import { ComposeService } from '@services/compose.service';
import { Compose } from '@shared/interface/compose.int';
import { ComposeOption } from '@shared/interface/compose.option.int';
import { Roles } from '@common/security/guard/role.decorator';
import { Role } from '@common/security/model/role.enum';

@ApiUseTags('compose')
@Controller('compose')
@Roles(Role.ADMIN, Role.COMPOSE_ACCESS)
@UsePipes(ValidationPipe)
export class ComposeController {

  constructor(private composeService: ComposeService) { }

  @Post('')
  @HttpCode(HttpStatus.CREATED)

  createTask(@Body() compose: Compose) {
    return this.composeService.createCompose(compose);
  }

  @Put('/:reference')
  updateCompose(@Param('reference') reference: string, @Body() compose: Compose): string {
    if (reference !== compose.reference) {
      throw new FunctionalException('bad-compose-reference', 'Body and path param reference should be equals');
    }
    return this.composeService.updateCompose(compose);
  }

  @Post('/up/:reference')
  composeUp(@Param('reference') reference: string, @Body() compose: ComposeOption) {
    return this.composeService.composeUp(reference, compose);
  }

  @Post('/down/:reference')
  composeDown(@Param('reference') reference: string, @Body() compose: ComposeOption) {
    return this.composeService.composeDown(reference, compose);
  }

  @Delete('/:reference')
  deleteCompose(@Param('reference') reference: string) {
    return this.composeService.deleteCompose(reference);
  }

  @Get('list')
  listComposes(): Compose[] {
    return this.composeService.listComposes();
  }

  @Get('scan')
  scanComposes(): Promise<Compose[]> {
    return this.composeService.scanComposes();
  }
}
