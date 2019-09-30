import { IsString } from 'class-validator';

export class Folder {
  @IsString()
  reference?: string;

  @IsString()
  libelle: string;

  @IsString()
  path: string;
}
