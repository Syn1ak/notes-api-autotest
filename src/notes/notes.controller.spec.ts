import { Test, TestingModule } from '@nestjs/testing';
import { NotesController } from './notes.controller';
import { NotesService } from './notes.service';
import { ICreateNoteDto, IUpdateNoteDto, INoteDto, INoteListDto } from './dto/note.dto';
import { NotFoundException } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { ConfigService } from '@nestjs/config';

const mockNotesService = {
  findAllNotes: jest.fn(),
  createNote: jest.fn(),
  getNoteById: jest.fn(),
  updateNote: jest.fn(),
  removeNote: jest.fn(),
};

describe('NotesController', () => {
  let controller: NotesController;
  let service: typeof mockNotesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [NotesController],
      providers: [
        {
          provide: NotesService,
          useValue: mockNotesService,
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<NotesController>(NotesController);
    service = module.get(NotesService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  // GET /notes
  describe('findAll', () => {
    it('should call service.findAllNotes and return the result', async () => {
      const expectedResult: INoteListDto = { items: [{ id: uuidv4(), title: 'Test', content: 'Test content' }] };
      service.findAllNotes.mockResolvedValue(expectedResult);

      const result = await controller.findAll();

      expect(result).toEqual(expectedResult);
      expect(service.findAllNotes).toHaveBeenCalledTimes(1);
    });
  });

  // POST /notes
  describe('create', () => {
    it('should call service.createNote with dto and return the result', async () => {
      const createDto: ICreateNoteDto = { title: 'New Note', content: 'New Content' };
      const expectedResult: INoteDto = { id: uuidv4(), ...createDto, content: createDto.content || '' };
      service.createNote.mockResolvedValue(expectedResult);

      const result = await controller.create(createDto);

      expect(result).toEqual(expectedResult);
      expect(service.createNote).toHaveBeenCalledWith(createDto);
      expect(service.createNote).toHaveBeenCalledTimes(1);
    });
  });

  // GET /notes/:id
  describe('findOne', () => {
    it('should call service.getNoteById with id and return the result', async () => {
      const noteId = uuidv4();
      const expectedResult: INoteDto = { id: noteId, title: 'Found Note', content: 'Found Content' };
      service.getNoteById.mockResolvedValue(expectedResult);

      const result = await controller.findOne(noteId);

      expect(result).toEqual(expectedResult);
      expect(service.getNoteById).toHaveBeenCalledWith(noteId);
      expect(service.getNoteById).toHaveBeenCalledTimes(1);
    });

    it('should propagate NotFoundException from service', async () => {
      const noteId = uuidv4();
      service.getNoteById.mockRejectedValue(new NotFoundException());

      await expect(controller.findOne(noteId)).rejects.toThrow(NotFoundException);
      expect(service.getNoteById).toHaveBeenCalledWith(noteId);
    });
  });

  // PUT /notes/:id
  describe('update', () => {
    it('should call service.updateNote with id and dto and return the result', async () => {
      const noteId = uuidv4();
      const updateDto: IUpdateNoteDto = { title: 'Updated Title' };
      const expectedResult: INoteDto = { id: noteId, title: 'Updated Title', content: 'Existing Content' };
      service.updateNote.mockResolvedValue(expectedResult);

      const result = await controller.update(noteId, updateDto);

      expect(result).toEqual(expectedResult);
      expect(service.updateNote).toHaveBeenCalledWith(noteId, updateDto);
      expect(service.updateNote).toHaveBeenCalledTimes(1);
    });

    it('should propagate NotFoundException from service', async () => {
      const noteId = uuidv4();
      const updateDto: IUpdateNoteDto = { title: 'Updated Title' };
      service.updateNote.mockRejectedValue(new NotFoundException());

      await expect(controller.update(noteId, updateDto)).rejects.toThrow(NotFoundException);
      expect(service.updateNote).toHaveBeenCalledWith(noteId, updateDto);
    });
  });

  // DELETE /notes/:id
  describe('remove', () => {
    it('should call service.removeNote with id and return the result', async () => {
      const noteId = uuidv4();
      const expectedResult = { success: true };
      service.removeNote.mockResolvedValue(expectedResult);

      const result = await controller.remove(noteId);

      expect(result).toEqual(expectedResult);
      expect(service.removeNote).toHaveBeenCalledWith(noteId);
      expect(service.removeNote).toHaveBeenCalledTimes(1);
    });

    it('should propagate NotFoundException from service', async () => {
      const noteId = uuidv4();
      service.removeNote.mockRejectedValue(new NotFoundException());

      await expect(controller.remove(noteId)).rejects.toThrow(NotFoundException);
      expect(service.removeNote).toHaveBeenCalledWith(noteId);
    });
  });
});
