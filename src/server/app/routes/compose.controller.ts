import {
  Post, HttpCode, UsePipes, HttpStatus, Body, Controller, Get, Param, Put, Delete
} from '@nestjs/common';
import { CustomValidationPipe } from '@common/validations/custom-validation.pipe';
import { ApiUseTags } from '@nestjs/swagger';
import { FunctionalException } from '@common/exception/functional.exception';
import { ComposeService } from '@services/compose.service';
import { Compose } from '@shared/interface/compose.int';

@ApiUseTags('compose')
@Controller('compose')
export class ComposeController {

  constructor(private composeService: ComposeService) { }

  @Post('')
  @HttpCode(HttpStatus.CREATED)
  @UsePipes(CustomValidationPipe)
  createTask(@Body() compose: Compose): string {
    return this.composeService.createCompose(compose);
  }

  @Put('/:reference')
  @UsePipes(CustomValidationPipe)
  updateCompose(@Param('reference') reference: string, @Body() compose: Compose): string {
    if (reference !== compose.reference) {
      throw new FunctionalException('bad-compose-reference', 'Body and path param reference should be equals');
    }
    return this.composeService.updateCompose(compose);
  }

  @Delete('/:reference')
  deleteCompose(@Param('reference') reference: string): void {
    this.composeService.deleteCompose(reference);
  }

  @Get('list')
  uploadInfos(): Compose[] {
    return this.composeService.listComposes();
  }
}
