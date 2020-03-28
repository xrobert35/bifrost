import {
  Post, HttpCode, UsePipes, HttpStatus, Body, Controller, Get, Param, Put, Delete
} from '@nestjs/common';
import { CustomValidationPipe } from '@common/validations/custom-validation.pipe';
import { ApiUseTags } from '@nestjs/swagger';
import { TaskService } from '@services/task.service';
import { Task } from '@shared/interface/task.int';
import { FunctionalException } from '@common/exception/functional.exception';


@ApiUseTags('task')
@Controller('task')
export class TaskController {

  constructor(private taskService: TaskService) { }

  @Post('')
  @HttpCode(HttpStatus.CREATED)
  @UsePipes(CustomValidationPipe)
  createTask(@Body() task: Task): string {
    return this.taskService.createTask(task);
  }

  @Put('/:reference')
  @UsePipes(CustomValidationPipe)
  updateTask(@Param('reference') reference: string, @Body() task: Task): string {
    if (reference !== task.reference) {
      throw new FunctionalException('bad-task-reference', 'Body and path param reference should be equals');
    }
    return this.taskService.updateTask(task);
  }

  @Delete('/:reference')
  deleteTask(@Param('reference') reference: string): void {
    this.taskService.deleteTask(reference);
  }

  @Get('list')
  uploadInfos(): Task[] {
    return this.taskService.listTasks();
  }
}
