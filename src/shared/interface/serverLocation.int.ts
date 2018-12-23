import { IsString, IsBoolean } from 'class-validator';

export class ServerLocation {
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
  @IsBoolean()
  activated: boolean;
}
