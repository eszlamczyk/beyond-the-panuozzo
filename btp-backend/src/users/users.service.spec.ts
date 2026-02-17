import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { UsersService } from './users.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from './users.entity';
import type { ObjectLiteral, Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';

const mockUserRepository = () => ({
  findOneBy: jest.fn(),
});

type MockRepository<T extends ObjectLiteral> = Partial<
  Record<keyof Repository<T>, jest.Mock>
>;

describe('UsersService', () => {
  let service: UsersService;
  let repository: MockRepository<User>;

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
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useFactory: mockUserRepository,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    repository = module.get<MockRepository<User>>(getRepositoryToken(User));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findOne', () => {
    it('should return a single user', async () => {
      repository.findOneBy!.mockResolvedValue(mockUser);
      const result = await service.findOne(mockUserId);
      expect(repository.findOneBy).toHaveBeenCalledWith({ id: mockUserId });
      expect(result).toEqual(mockUser);
    });

    it('should throw NotFoundException if user is not found', async () => {
      repository.findOneBy!.mockResolvedValue(null);
      await expect(service.findOne(mockUserId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
