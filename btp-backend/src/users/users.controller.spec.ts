import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import type { CreateUserDto } from './dto/create-user.dto';
import type { UpdateUserDto } from './dto/update-user.dto';
import type { User } from './users.entity';

const mockUsersService = {
  create: jest.fn(),
  findAll: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
};

describe('UsersController', () => {
  let controller: UsersController;
  let service: UsersService;

  const mockUserId = 'user-uuid-123';
  const mockUser = {
    id: mockUserId,
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    phoneNumber: '+15551234567',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a user', async () => {
      const createUserDto: CreateUserDto = mockUser;
      const createSpy = jest
        .spyOn(service, 'create')
        .mockResolvedValue(mockUser as unknown as User);
      const result = await controller.create(createUserDto);
      expect(createSpy).toHaveBeenCalledWith(createUserDto);
      expect(result).toEqual(mockUser);
    });
  });

  describe('findAll', () => {
    it('should return an array of users', async () => {
      const findSpy = jest
        .spyOn(service, 'findAll')
        .mockResolvedValue([mockUser] as unknown as User[]);
      const result = await controller.findAll();
      expect(findSpy).toHaveBeenCalled();
      expect(result).toEqual([mockUser]);
    });
  });

  describe('findOne', () => {
    it('should return a single user', async () => {
      const findSpy = jest
        .spyOn(service, 'findOne')
        .mockResolvedValue(mockUser as unknown as User);
      const result = await controller.findOne(mockUserId);
      expect(findSpy).toHaveBeenCalledWith(mockUserId);
      expect(result).toEqual(mockUser);
    });
  });

  describe('update', () => {
    it('should update a user', async () => {
      const updateUserDto: UpdateUserDto = { firstName: 'Jane' };
      const updatedUser = { ...mockUser, ...updateUserDto };
      const updateSpy = jest
        .spyOn(service, 'update')
        .mockResolvedValue(updatedUser as unknown as User);
      const result = await controller.update(mockUserId, updateUserDto);
      expect(updateSpy).toHaveBeenCalledWith(mockUserId, updateUserDto);
      expect(result).toEqual(updatedUser);
    });
  });

  describe('remove', () => {
    it('should remove a user', async () => {
      const removeSpy = jest
        .spyOn(service, 'remove')
        .mockResolvedValue(undefined);
      const result = await controller.remove(mockUserId);
      expect(removeSpy).toHaveBeenCalledWith(mockUserId);
      expect(result).toBeUndefined();
    });
  });
});
