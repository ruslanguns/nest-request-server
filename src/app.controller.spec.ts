import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { User } from '.prisma/client';
import { UserProfile } from '.prisma/client';
import { UserProfilePhoto } from '.prisma/client';
import { RequestedJobCard } from '.prisma/client';

const mockUser: User = {
  id: '1',
  email: 'example@domain.tld',
  birthday: new Date(),
  firstName: 'Ruslan',
  lastName: 'Gonzalez',
  learnerId: '12345',
  ni: '54321',
  phone: '123 456 789',
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockUserProfile: UserProfile = {
  id: '1',
  userId: '1',
  address1: 'line 1',
  address2: 'line 2',
  address3: 'line 3',
  county: 'county',
  postcode: '12345',
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockUserProfilePhoto: UserProfilePhoto = {
  id: '1',
  userId: '1',
  url: 'http://download/file',
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockRequestJobCard: RequestedJobCard = {
  id: '1',
  jobCardId: '1',
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe('AppController', () => {
  let controller: AppController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [
        {
          provide: AppService,
          useValue: {
            getRandomUser: jest.fn().mockReturnValue(mockUser),
            addUserAddress: jest.fn().mockReturnValue(mockUserProfile),
            updateUserProfilePhoto: jest
              .fn()
              .mockRejectedValue(mockUserProfilePhoto),
            uploadFile: jest.fn(),
            downloadFile: jest.fn(),
            requestJobCard: jest.fn().mockReturnValue(mockRequestJobCard),
            getRequestedJobCards: jest
              .fn()
              .mockReturnValue([mockRequestJobCard, mockRequestJobCard]),
          },
        },
      ],
    }).compile();
    controller = app.get<AppController>(AppController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getRandomUser', () => {
    test('should return a random user', async () => {
      const result = await controller.getRandomUser();
      expect(typeof result).toBe('object');
      expect(result.firstName).toBeDefined();
      expect(result.lastName).toBe(mockUser.lastName);
      expect(result.birthday).toBe(mockUser.birthday);
    });
  });

  describe('updateUserAddress', () => {
    test('should create/update the user address', async () => {
      const result = await controller.updateUserAddress({
        ...mockUserProfile,
      });
      expect(typeof result).toBe('object');
      expect(result.address1).toBeDefined();
      expect(result.address2).toBeDefined();
      expect(result.userId).toBeDefined();
    });
  });

  describe('updateUserProfilePhoto', () => {
    test('should create/update a user profile photo', () => {
      //TODO: Testing not implemented yet
    });
  });

  describe('uploadFile', () => {
    test('should upload a file properly to AWS using squareboat/nest-storage library', () => {
      //TODO: Testing not implemented yet
    });
  });

  describe('readFile', () => {
    test('should download a file and stream it like a proxy', () => {
      //TODO: Testing not implemented yet
    });
  });

  describe('newRequest', () => {
    test('should create/update a request job card', async () => {
      const result = await controller.newRequest({
        ...mockRequestJobCard,
      });
      expect(typeof result).toBe('object');
      expect(result.id).toBeDefined();
      expect(result.jobCardId).toBeDefined();
    });
  });

  describe('getRequests', () => {
    test('should return a list of the requested job cards', async () => {
      const result = await controller.getRequests();
      expect(typeof result).toBe('object');
      expect(result[0].id).toBeDefined();
      expect(result[1].jobCardId).toBeDefined();
    });
  });
});
