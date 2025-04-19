import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Note } from './entities/note.entity';
import { ICreateNoteDto, IUpdateNoteDto, INoteDto, INoteListDto } from './dto/note.dto';

@Injectable()
export class NotesService {

  constructor(
    @InjectRepository(Note)
    private notesRepository: Repository<Note>,
  ) {}

  private mapNoteToDto(note: Note): INoteDto {
    return {
      id: note.id,
      title: note.title,
      content: note.content ?? '',
    };
  }

  async findAllNotes(): Promise<INoteListDto> {
    const notes = await this.notesRepository.find({
      order: { title: 'ASC' }
    });
    const items: INoteDto[] = notes.map(this.mapNoteToDto);
    return { items };
  }

  async createNote(createNoteDto: ICreateNoteDto): Promise<INoteDto> {
    const newNote = this.notesRepository.create({
      title: createNoteDto.title,
      content: createNoteDto.content || null,
    });
    const savedNote = await this.notesRepository.save(newNote);
    return this.mapNoteToDto(savedNote);
  }

  async getNoteById(id: string): Promise<INoteDto> {
    const note = await this.notesRepository.findOneBy({ id });
    if (!note) {
      throw new NotFoundException(`Note with ID "${id}" not found`);
    }
    return this.mapNoteToDto(note);
  }

  async updateNote(id: string, updateNoteDto: IUpdateNoteDto): Promise<INoteDto> {
    const noteToUpdate = await this.notesRepository.preload({
      id: id,
      title: updateNoteDto.title,
      content: updateNoteDto.content !== undefined ? (updateNoteDto.content || null) : undefined,
    });

    if (!noteToUpdate) {
      throw new NotFoundException(`Note with ID "${id}" not found`);
    }

    const updatedNote = await this.notesRepository.save(noteToUpdate);
    return this.mapNoteToDto(updatedNote);
  }

  async removeNote(id: string): Promise<{ success: boolean }> {
    const result = await this.notesRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Note with ID "${id}" not found`);
    }
    return { success: true };
  }
}
