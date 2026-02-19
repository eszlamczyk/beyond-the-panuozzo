import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { UsersService } from './users.service';
import { UsersRepositoryPort } from './users-repository.port';
import { NotFoundException } from '@nestjs/common';
import type { UserModel } from './user.model';

const mockUsersRepository: jest.Mocked<UsersRepositoryPort> = {
  findAll: jest.fn(),
  findOne: jest.fn(),
  findByEmail: jest.fn(),
};

describe('UsersService', () => {
  let service: UsersService;
  let repository: jest.Mocked<UsersRepositoryPort>;

  const mockUserId = 'user-uuid-123';
  const mockUser: UserModel = {
    id: mockUserId,
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    phoneNumber: '+15551234567',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: UsersRepositoryPort,
          useValue: mockUsersRepository,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    repository = module.get(UsersRepositoryPort);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findOne', () => {
    it('should return a single user', async () => {
      repository.findOne.mockResolvedValue(mockUser);
      const result = await service.findOne(mockUserId);
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(repository.findOne).toHaveBeenCalledWith(mockUserId);
      expect(result).toEqual(mockUser);
    });

    it('should throw NotFoundException if user is not found', async () => {
      repository.findOne.mockRejectedValue(
        new NotFoundException(`User with ID "${mockUserId}" not found`),
      );
      await expect(service.findOne(mockUserId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
