import { IsBoolean } from 'class-validator';

export class ComposeOption {
  @IsBoolean()
  compatibility: boolean;
}
