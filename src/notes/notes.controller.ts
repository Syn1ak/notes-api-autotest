import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
  HttpCode,
  HttpStatus,
  ParseUUIDPipe,
} from '@nestjs/common';
import { NotesService } from './notes.service';
import { ICreateNoteDto, IUpdateNoteDto, INoteDto, INoteListDto } from './dto/note.dto';

@Controller('notes')
export class NotesController {

  constructor(private readonly notesService: NotesService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  async findAll(): Promise<INoteListDto> {
    return this.notesService.findAllNotes();
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createNoteDto: ICreateNoteDto): Promise<INoteDto> {
    return this.notesService.createNote(createNoteDto);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async findOne(@Param('id', ParseUUIDPipe) id: string): Promise<INoteDto> {
    return this.notesService.getNoteById(id);
  }

  @Put(':id')
  @HttpCode(HttpStatus.OK)
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateNoteDto: IUpdateNoteDto,
  ): Promise<INoteDto> {
    return this.notesService.updateNote(id, updateNoteDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async remove(@Param('id', ParseUUIDPipe) id: string): Promise<{ success: boolean }> {
    return this.notesService.removeNote(id);
  }
}
