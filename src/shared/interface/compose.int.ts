import { IsString, IsNotEmpty } from 'class-validator';

export class Compose {

  @IsString()
  reference?: string;

  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  compose: string;
}
