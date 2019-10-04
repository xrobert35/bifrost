import { IsString, IsNotEmpty } from 'class-validator';

export class Folder {
  @IsString()
  reference?: string;

  @IsNotEmpty()
  @IsString()
  libelle: string;

  @IsNotEmpty()
  @IsString()
  path: string;
}
