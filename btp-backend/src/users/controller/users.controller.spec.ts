import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { JwtAuthenticationGuard } from '../../auth/authentication/jwt-authentication.guard';
import { EmailDomainGuard } from '../../auth/authorization/email-domain.guard';
import { UsersController } from './users.controller';
import { UsersService } from '../domain/users.service';
import { NotFoundException } from '@nestjs/common';
import type { UserModel } from '../domain/user.model';

const mockUsersService = {
  findOne: jest.fn(),
};

describe('UsersController', () => {
  let controller: UsersController;
  let service: UsersService;

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
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
      ],
    })
      .overrideGuard(JwtAuthenticationGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(EmailDomainGuard)
      .useValue({ canActivate: () => true })
      .compile();

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
    it('should return a single user response dto', async () => {
      const findSpy = jest
        .spyOn(service, 'findOne')
        .mockResolvedValue(mockUser);
      const result = await controller.findOne(mockUserId);
      expect(findSpy).toHaveBeenCalledWith(mockUserId);
      expect(result).toEqual(mockUser);
    });

    it('should throw NotFoundException (404) when user not found', async () => {
      jest
        .spyOn(service, 'findOne')
        .mockRejectedValue(
          new NotFoundException(`User with ID "${mockUserId}" not found`),
        );
      await expect(controller.findOne(mockUserId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
