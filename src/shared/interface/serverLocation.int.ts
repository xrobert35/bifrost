import { IsString } from 'class-validator';

export class ServerLocation {

  @IsString()
  reference?: string;

  // unique ID
  @IsString()
  name: string;

  @IsString()
  path: string;

  @IsString()
  root?: string;

  @IsString()
  index?: string;

  @IsString()
  proxyPass?: string;
}
