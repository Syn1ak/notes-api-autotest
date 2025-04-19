import { IsString, IsOptional, IsNotEmpty, IsUUID, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class INoteDto {
  @IsUUID()
  id: string;

  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  content: string;
}

export class INoteListDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => INoteDto)
  items: INoteDto[];
}


export class ICreateNoteDto {
  @IsString()
  @IsNotEmpty({ message: 'Title cannot be empty' })
  title: string;

  @IsString()
  @IsOptional()
  content?: string;
}

// DTO для оновлення нотатки (тіло запиту PUT)
export class IUpdateNoteDto {
  @IsString()
  @IsNotEmpty()
  @IsOptional() // Можна оновити тільки title
  title?: string;

  @IsString()
  @IsOptional() // Можна оновити тільки content
  content?: string;
}
