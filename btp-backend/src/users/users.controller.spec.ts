import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { HttpStatus, NotFoundException } from '@nestjs/common';
import type { User } from './users.entity';

const mockUsersService = {
  findOne: jest.fn(),
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

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
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

    it('should throw NotFoundException (404) when user not found', async () => {
      jest.spyOn(service, 'findOne').mockRejectedValue(
        new NotFoundException(`User with ID "${mockUserId}" not found`),
      );
      const err = await controller.findOne(mockUserId).catch((e) => e);
      expect(err).toBeInstanceOf(NotFoundException);
      expect(err.getStatus()).toBe(HttpStatus.NOT_FOUND);
    });
  });
});
