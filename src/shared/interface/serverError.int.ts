import { IsString } from 'class-validator';

export class ServerError {
  @IsString()
  page: string;
  @IsString()
  location?: string;
  @IsString()
  root?: string;
}
