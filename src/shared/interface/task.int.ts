import { IsString, IsNotEmpty } from 'class-validator';

export class Task {

  @IsString()
  reference?: string;

  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  scriptName: string;

  @IsNotEmpty()
  @IsString()
  script: string;

  @IsString()
  @IsNotEmpty()
  schedulerPattern: string;
}
