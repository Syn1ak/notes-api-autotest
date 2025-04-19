import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { NotesService } from './notes.service';
import { Note } from './entities/note.entity';
import { ICreateNoteDto, IUpdateNoteDto, INoteDto } from './dto/note.dto';

type MockRepository<T = any> = Partial<Record<keyof Repository<T>, jest.Mock>>;

const createMockRepository = <T = any>(): MockRepository<T> => ({
  find: jest.fn(),
  findOneBy: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  preload: jest.fn(),
  delete: jest.fn(),
});

describe('NotesService', () => {
  let service: NotesService;
  let repository: MockRepository<Note>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotesService,
        {
          provide: getRepositoryToken(Note),
          useValue: createMockRepository(),
        },
      ],
    }).compile();

    service = module.get<NotesService>(NotesService);
    repository = module.get<MockRepository<Note>>(getRepositoryToken(Note));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // findAllNotes
  describe('findAllNotes', () => {
    it('should return an array of notes DTOs', async () => {
      const mockNotes: Note[] = [
        { id: uuidv4(), title: 'Test Note 1', content: 'Content 1' },
        { id: uuidv4(), title: 'Test Note 2', content: null },
      ];

      repository.find.mockResolvedValue(mockNotes);

      const result = await service.findAllNotes();

      expect(result).toEqual({
        items: [
          { id: mockNotes[0].id, title: 'Test Note 1', content: 'Content 1' },
          { id: mockNotes[1].id, title: 'Test Note 2', content: '' },
        ]
      });
      expect(repository.find).toHaveBeenCalled();
    });
  });

  // createNote
  describe('createNote', () => {
    it('should successfully create a note and return its DTO', async () => {
      const createDto: ICreateNoteDto = { title: 'New Note', content: 'New Content' };
      const mockNoteEntity = { id: uuidv4(), title: createDto.title, content: createDto.content };
      const expectedDto: INoteDto = { id: mockNoteEntity.id, title: createDto.title, content: createDto.content };

      repository.create.mockReturnValue(mockNoteEntity);
      repository.save.mockResolvedValue(mockNoteEntity);

      const result = await service.createNote(createDto);

      expect(result).toEqual(expectedDto);
      expect(repository.create).toHaveBeenCalledWith({ title: createDto.title, content: createDto.content || null });
      expect(repository.save).toHaveBeenCalledWith(mockNoteEntity);
    });

    it('should create a note with empty content string in DTO if content is omitted', async () => {
      const createDto: ICreateNoteDto = { title: 'Note Without Content' };
      const mockNoteEntity: Note = { id: uuidv4(), title: createDto.title, content: null };
      const expectedDto: INoteDto = { id: mockNoteEntity.id, title: createDto.title, content: '' };

      repository.create.mockReturnValue(mockNoteEntity);
      repository.save.mockResolvedValue(mockNoteEntity);

      const result = await service.createNote(createDto);

      expect(result).toEqual(expectedDto);
      expect(repository.create).toHaveBeenCalledWith({ title: createDto.title, content: null });
      expect(repository.save).toHaveBeenCalledWith(mockNoteEntity);
    });
  });

  // getNoteById
  describe('getNoteById', () => {
    it('should return a single note DTO if found', async () => {
      const noteId = uuidv4();
      const mockNote: Note = { id: noteId, title: 'Found Note', content: 'Found Content' };
      const expectedDto: INoteDto = { id: noteId, title: 'Found Note', content: 'Found Content' };

      repository.findOneBy.mockResolvedValue(mockNote);

      const result = await service.getNoteById(noteId);
      expect(result).toEqual(expectedDto);
      expect(repository.findOneBy).toHaveBeenCalledWith({ id: noteId });
    });

    it('should throw NotFoundException if note is not found', async () => {
      const noteId = uuidv4();
      repository.findOneBy.mockResolvedValue(null);

      await expect(service.getNoteById(noteId)).rejects.toThrow(NotFoundException);
      expect(repository.findOneBy).toHaveBeenCalledWith({ id: noteId });
    });
  });

  // updateNote
  describe('updateNote', () => {
    const noteId = uuidv4();
    const updateDto: IUpdateNoteDto = { title: 'Updated Title', content: 'Updated Content' };
    const preloadedData = { id: noteId, title: updateDto.title, content: updateDto.content };
    const expectedDto: INoteDto = { id: noteId, title: updateDto.title, content: updateDto.content };


    it('should update an existing note and return its DTO', async () => {
      repository.preload.mockResolvedValue(preloadedData);
      repository.save.mockResolvedValue(preloadedData);

      const result = await service.updateNote(noteId, updateDto);

      expect(result).toEqual(expectedDto);
      expect(repository.preload).toHaveBeenCalledWith({ id: noteId, title: updateDto.title, content: updateDto.content || null });
      expect(repository.save).toHaveBeenCalledWith(preloadedData);
    });

    it('should throw NotFoundException if note to update is not found', async () => {
      repository.preload.mockResolvedValue(undefined);

      await expect(service.updateNote(noteId, updateDto)).rejects.toThrow(NotFoundException);
      expect(repository.preload).toHaveBeenCalledWith({ id: noteId, title: updateDto.title, content: updateDto.content || null });
      expect(repository.save).not.toHaveBeenCalled();
    });
  });

  // removeNote
  describe('removeNote', () => {
    it('should remove a note successfully and return { success: true }', async () => {
      const noteId = uuidv4();
      repository.delete.mockResolvedValue({ affected: 1, raw: {} });

      const result = await service.removeNote(noteId);

      expect(result).toEqual({ success: true });
      expect(repository.delete).toHaveBeenCalledWith(noteId);
    });

    it('should throw NotFoundException if note to delete is not found', async () => {
      const noteId = uuidv4();
      repository.delete.mockResolvedValue({ affected: 0, raw: {} });

      await expect(service.removeNote(noteId)).rejects.toThrow(NotFoundException);
      expect(repository.delete).toHaveBeenCalledWith(noteId);
    });
  });

});
