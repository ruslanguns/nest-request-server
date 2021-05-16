import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { CoreModule } from './../src/core/core.module';
import { AppService } from './../src/app.service';

describe('AppController (e2e)', () => {
  let app: INestApplication;
  const appService = {
    getRandomUser: () => ({
      id: '1',
      email: 'example@domain.tld',
      birthday: new Date('2021-05-16T19:05:53.229Z'),
      firstName: 'Ruslan',
      lastName: 'Gonzalez',
      learnerId: '12345',
      ni: '54321',
      phone: '123 456 789',
      createdAt: new Date('2021-05-16T19:05:53.229Z'),
      updatedAt: new Date('2021-05-16T19:05:53.229Z'),
    }),
    addUserAddress: () => ({
      id: '1',
      userId: '1',
      address1: 'line 1',
      address2: 'line 2',
      address3: 'line 3',
      county: 'county',
      postcode: '12345',
      createdAt: new Date('2021-05-16T19:05:53.229Z'),
      updatedAt: new Date('2021-05-16T19:05:53.229Z'),
    }),
    updateUserProfilePhoto: () => ({
      id: '1',
      userId: '1',
      url: 'http://download/file',
      createdAt: new Date('2021-05-16T19:05:53.229Z'),
      updatedAt: new Date('2021-05-16T19:05:53.229Z'),
    }),
    uploadFile: () => ({
      ETag: '',
      Location: '',
      key: '',
      Key: '',
      Bucket: '',
    }),
    downloadFile: () => null,
    requestJobCard: () => ({
      id: '1',
      jobCardId: '1',
      createdAt: new Date('2021-05-16T19:05:53.229Z'),
      updatedAt: new Date('2021-05-16T19:05:53.229Z'),
    }),
    getRequestedJobCards: () => [
      {
        id: '1',
        jobCardId: '1',
        createdAt: new Date('2021-05-16T19:05:53.229Z'),
        updatedAt: new Date('2021-05-16T19:05:53.229Z'),
      },
      {
        id: '1',
        jobCardId: '1',
        createdAt: new Date('2021-05-16T19:05:53.229Z'),
        updatedAt: new Date('2021-05-16T19:05:53.229Z'),
      },
    ],
  };

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule, ScheduleModule.forRoot(), CoreModule],
      providers: [AppService],
    })
      .overrideProvider(AppService)
      .useValue(appService)
      .compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();
  });

  test('/ (GET)', () => {
    return request(app.getHttpServer()).get('/').expect(404);
  });

  describe('/user/random (GET)', () => {
    test('should retrieve a random user', async () => {
      const randomUser = appService.getRandomUser();
      const response = await request(app.getHttpServer()).get('/user/random').expect(200);
      expect(response.body['firstName']).toEqual(randomUser.firstName);
      expect(response.body['email']).toEqual(randomUser.email);
      expect(new Date(response.body['createdAt'])).toEqual(randomUser.createdAt);
    });
  });

  describe('/user/address (PUT)', () => {
    test('should throw errors when missing form inputs', async () => {
      const response = await request(app.getHttpServer()).put('/user/address').expect(400);

      expect(response.body['statusCode']).toEqual(400);
      expect(response.body['error']).toBe('Bad Request');
      expect(response.body['message']).toContain('userId must be a string');
      expect(response.body['message']).toContain('userId should not be empty');
      expect(response.body['message']).toContain('address1 must be a string');
      expect(response.body['message']).toContain('address1 should not be empty');
      expect(response.body['message']).toContain('address2 must be a string');
      expect(response.body['message']).toContain('address2 should not be empty');
      expect(response.body['message']).toContain('address3 must be a string');
      expect(response.body['message']).toContain('address3 should not be empty');
      expect(response.body['message']).toContain('county must be a string');
      expect(response.body['message']).toContain('county should not be empty');
      expect(response.body['message']).toContain('postcode must be a string');
      expect(response.body['message']).toContain('postcode should not be empty');
      expect(response.body['message']).toContain('postcode should not be empty');
    });

    test(`should update/create the address to the user's profile`, async () => {
      const userProfileAddress = appService.addUserAddress();
      const response = await request(app.getHttpServer()).put('/user/address').expect(200).send({
        userId: '1',
        address1: 'line 1',
        address2: 'line 2',
        address3: 'line 3',
        county: 'county',
        postcode: '12345',
      });

      expect(response.body['id']).toEqual(userProfileAddress.id);
      expect(response.body['address1']).toEqual(userProfileAddress.address1);
      expect(response.body['postcode']).toEqual(userProfileAddress.postcode);
    });
  });

  describe('/user/photo/:userId (PUT)', () => {
    test('should throw error uploading unallowed format on the user profile photo', async () => {
      const buffer = Buffer.from('some data');
      const response = await request(app.getHttpServer())
        .put('/user/photo/1')
        .attach('file', buffer, 'name.pdf')
        .expect(400);
      expect(response.body['statusCode']).toBe(400);
      expect(response.body['message']).toBe('Only image files are allowed');
      expect(response.body['error']).toBe('Bad Request');
    });

    test('should throw error when missing the userId param', async () => {
      const buffer = Buffer.from('some data');
      const response = await request(app.getHttpServer())
        .put('/user/photo/')
        .attach('file', buffer, 'name.jpg')
        .expect(404);
      expect(response.body['statusCode']).toBe(404);
      expect(response.body['error']).toBe('Not Found');
    });

    test('should update/create and upload the user profile photo', async () => {
      const buffer = Buffer.from('some data');
      const response = await request(app.getHttpServer())
        .put('/user/photo/1')
        .attach('file', buffer, 'name.jpg')
        .expect(200);
      expect(response.body['id']).toBe(appService.updateUserProfilePhoto().id);
    });
  });

  test('/request/job-card (GET)', () => {
    // TODO: E2E Testing not implemented yet
  });

  test('/request/job-card (POST)', () => {
    // TODO: E2E Testing not implemented yet
  });

  test('/file/upload (POST)', () => {
    // TODO: E2E Testing not implemented yet
  });

  test('/file/download/:fileName (GET)', () => {
    // TODO: E2E Testing not implemented yet
  });
});
