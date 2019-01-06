import { ServerError } from './serverError.int';
import { ServerLocation } from './serverLocation.int';
import { Type } from 'class-transformer';
import { IsNumber, IsString, ValidateNested, Allow, IsBoolean } from 'class-validator';

export class Server {

  @IsBoolean()
  onlyActive: boolean;

  @IsNumber()
  port: number;

  @IsString()
  serverName: string;

  @Allow()
  @Type(() => ServerLocation)
  locations: ServerLocation[];

  @Type(() => ServerError)
  @ValidateNested()
  error?: ServerError;
}
