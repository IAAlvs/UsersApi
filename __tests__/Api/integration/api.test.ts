import request from "supertest";
import app from "../../../src/api/server";
import { sequelize } from "../../../src/database/sequelize.config.js";
import { User } from "../../../src/api/models/user";
import { UserFiles } from "../../../src/api/models/user-file";
import {getTestToken, configureEnvv} from "../utils/generateTestPayload";
/* DONT CHANGE TO IMPORT !!!! */
const authDependency =  require("../../../src/api/middlewares/Authorization/AuthorizationMiddleware");
import { JsonWebTokenError } from "jsonwebtoken";
import { CreateUserResponseDto } from "../../../src/api/controllers/userController";
import { PatchUserFileRequestDto } from "@/api/dtos/UserDtos";
import { iocContainer } from "../../../src/api/aspects/inversify.config";
import TYPES from "../../../src/api/interfaces/ServiceTypes";
import { UserServiceInterface } from "../../../src/api/interfaces/UserServiceInterface";
import { IocContainer } from "tsoa";
import { addDays } from "../utils/dates";
import crypto from "crypto";
import { UserSubscriptions } from "../../../src/api/models/users-subscription";

// Mock the 'database.js' module that imports Sequelize
//change environment to test
describe('Integration Tests', () => {
  beforeAll(async () =>{
    configureEnvv();
    //token= configureEnv.token as unknown as string;
    await sequelize.sync({ force: true });
    const userToAdd = {
      id : '61ad624c-7233-4839-8ece-49fe0e3041ce',
      authId : '61ad624c-7233-4839-8ece-49fe0e3041ce',
      email : "emailtests@gmail.com",
      emailVerified : true, 
      picture : "pictureUrl",
      name: 'John',
      lastName: 'Doe',
      secondLastName: 'Doe2',
      age : 50, 
      address : "Address example"
    }
    const userToPatch = {
      id : '31ad624c-7233-4839-8ece-49fe0e3041ce',
      authId : '31ad624c-7233-4839-8ece-49fe0e3041ce',
      email : "emailtestspatch@gmail.com",
      emailVerified : false, 
      picture : "pictureUrl",
      name: 'Jane',
      lastName: 'Dame',
      secondLastName: 'Doe',
      age : 32, 
      address : "Address example"
    }
    const fileToAdd = {
      userId : '61ad624c-7233-4839-8ece-49fe0e3041ce',
      fileId : '62ad624c-7233-4839-8ece-49fe0e3041ce',
      fileName : "fileName",
      fileSize : 10101,
      fileType : "pdf",
      dropDate : "2023-07-06",
      visible : true, 
      createdAt : new Date(),
      updatedAt : new Date()
    }
    const fileToPatch = {
      userId : '61ad624c-7233-4839-8ece-49fe0e3041ce',
      fileId : '82ad624c-7233-4839-8ece-49fe0e3041ce',
      fileName : "fileName",
      fileSize : 10101,
      fileType : "pdf",
      dropDate : "2023-07-06",
      visible : true, 
      createdAt : new Date(),
      updatedAt : new Date()
    }
    const userFileToDelete = {
      userId : '61ad624c-7233-4839-8ece-49fe0e3041ce',
      fileId : '62ad624c-7233-4839-9ece-49fe0e3041ce',
      fileName : "fileName",
      fileSize : 10101,
      fileType : "pdf",
      dropDate : "2023-07-06",
      visible : true, 
      createdAt : new Date(),
      updatedAt : new Date()
    }
    await User.create(userToAdd);
    await User.create(userToPatch);
    await UserFiles.create(fileToAdd);
    await UserFiles.create(fileToPatch)
    await UserFiles.create(userFileToDelete);

  },5000)
  beforeEach(()=>{
    authDependency.expressAuthentication = jest.fn().mockImplementation((request, securityScope, scopes?)=>
    {
      //We will send token docoded cause of test purpose
      const token = request.headers['authorization'];

        return new Promise((resolve, reject) =>{
          if(!token)
            reject(new JsonWebTokenError("Not token found"))
          const decoded = JSON.parse(token?.split(" ")[1]);
            if (decoded.aud != process.env.AUTH0_AUDIENCE_USERS) {
              reject(new JsonWebTokenError('UnAuthorized 1'));
            }
            if (decoded.iss != `https://${process.env.AUTH0_DOMAIN}/`) {
              reject(new JsonWebTokenError("UnAuthorized 2"));
            }
            if(scopes && scopes!.length !== 0)
            {
              for (let scope of scopes!) {
                if (!decoded.scope || !decoded.scope.includes(scope)) {
                  reject(new JsonWebTokenError("Unauthorized 3"));
                }
              }
            }
            resolve(decoded);
        })
    })
  })
  /* ENDPOINT GET USER BY ID */
  test('WithPermissionAndValidUserId_GetUser_SuccessUser', async () => {
    const scopes = ["read:users"]
    const userId = '61ad624c-7233-4839-8ece-49fe0e3041ce'
    const token = JSON.stringify(getTestToken(scopes));
    const expectedUser = {
      id : '61ad624c-7233-4839-8ece-49fe0e3041ce',
      authId : '61ad624c-7233-4839-8ece-49fe0e3041ce',
      email : "emailtests@gmail.com",
      emailVerified : true, 
      picture : "pictureUrl",
      name: 'John',
      lastName: 'Doe',
      secondLastName: 'Doe2',
      age : 50, 
      address : "Address example"
    };


    const response = await request(app).get(`/api/v1/users/${userId}`).
    set('Authorization', `Bearer ${token}`);
    const bodyResponse = response["body"]

    //First check dates that had happend same date no exactly time
    expect(new Date(bodyResponse.createdAt).toISOString().split("T")[0]).toEqual(new Date().toISOString().split("T")[0]);
    expect(new Date(bodyResponse.updatedAt).toISOString().split("T")[0]).toEqual(new Date().toISOString().split("T")[0]);
    delete bodyResponse.createdAt;  // or delete person["age"];
    delete bodyResponse.updatedAt;
    expect(authDependency.expressAuthentication).toHaveBeenCalledTimes(1);
    expect(response.status).toBe(200);
    expect(bodyResponse).toEqual(expectedUser)
  });

  test('WithOutRequiredScopes_GetUser_UnAuthorized', async () => {
    const scopes = ["read:user-files"]
    const userId = '61ad624c-7233-4839-8ece-49fe0e3041ce'
    const token = JSON.stringify(getTestToken(scopes));

    const response = await request(app).get(`/api/v1/users/${userId}`).
    set('Authorization', `Bearer ${token}`);
    const bodyResponse = response["body"]

    expect(authDependency.expressAuthentication).toHaveBeenCalledTimes(1);
    expect(response.status).toBe(401);
  });
  test('WithRequiredScopesNotFoundUserId_GetUser_404', async () => {
    const scopes = ["read:users"]
    const userId = '61ad624c-7233-4839-8ece-49fe0e3041ca'
    const token = JSON.stringify(getTestToken(scopes));

    const response = await request(app).get(`/api/v1/users/${userId}`).
    set('Authorization', `Bearer ${token}`);
    const bodyResponse = response["body"]

    expect(authDependency.expressAuthentication).toHaveBeenCalledTimes(1);
    expect(response.status).toBe(404);
  });
  test('WithRequiredScopesInvalidIdPatter_GetUser_422', async () => {
    const scopes = ["read:users"];
    const userId = 'invalidaidstrucutre';
    const token = JSON.stringify(getTestToken(scopes));

    const response = await request(app).get(`/api/v1/users/${userId}`).
    set('Authorization', `Bearer ${token}`);
    const bodyResponse = response["body"]

    expect(authDependency.expressAuthentication).toHaveBeenCalledTimes(1);
    expect(response.status).toBe(422);
  });

  test('WithOutAuthorization_GetUser_UnAuthorized', async () => {
    const userId = '61ad624c-7233-4839-8ece-49fe0e3041ce'

    const response = await request(app).get(`/api/v1/users/${userId}`);
    
    expect(authDependency.expressAuthentication).toHaveBeenCalledTimes(1);
    expect(response.status).toBe(401);
  });

  /* ENDPOINT GET USERS */
  test('WithPermission_GetUsers_SuccessUsers', async () => {
    const scopes = ["global:users"]
    const token = JSON.stringify(getTestToken(scopes));

    const response = await request(app).get('/api/v1/users').
    set('Authorization', `Bearer ${token}`);
    const bodyResponse = response["body"]

    expect(authDependency.expressAuthentication).toHaveBeenCalledTimes(1);
    expect(response.status).toBe(200);
    expect(bodyResponse.length).toBe(2);
    expect(bodyResponse[0].id).toBe('61ad624c-7233-4839-8ece-49fe0e3041ce');
  });
  test('WithOutRequiredScopes_GetUsers_UnAuthorized', async () => {
    const scopes = ["upload:user-files"]
    const token = JSON.stringify(getTestToken(scopes));

    const response = await request(app).get('/api/v1/users').
    set('Authorization', `Bearer ${token}`);
    const bodyResponse = response["body"]

    expect(authDependency.expressAuthentication).toHaveBeenCalledTimes(1);
    expect(response.status).toBe(401);
  });

  test('WithOutAuthorization_GetUsers_UnAuthorized', async () => {
    const response = await request(app).get('/api/v1/users');

    const bodyResponse = response["body"]
    
    expect(authDependency.expressAuthentication).toHaveBeenCalledTimes(1);
    expect(response.status).toBe(401);
  });

  /* ENDPOINT GET USER FILES */
  test('WithPermissionAndValidUserId_GetUserFiles_SuccessUserFile', async () => {
    const scopes = ["read:users"];
    const USERID = "61ad624c-7233-4839-8ece-49fe0e3041ce";
    const token = JSON.stringify(getTestToken(scopes));
    //We will test properties 1 by one 
    const expectedUserFile =   {
      userId : '61ad624c-7233-4839-8ece-49fe0e3041ce',
      fileId : '62ad624c-7233-4839-8ece-49fe0e3041ce',
      fileName : "fileName",
      fileSize : 10101,
      fileType : "pdf",
      dropDate : "2023-07-06",
      visible : true, 
      createdAt : "fakedate",
      updatedAt : "fakedate"
    }

    const response = await request(app).get(`/api/v1/users/${USERID}/files`).
    set('Authorization', `Bearer ${token}`);

    const bodyResponse = response["body"]
    const {userId, files} = bodyResponse;
    const {id, fileName, fileSize, fileType, dropDate, visible, createdAt, updatedAt} = files[0];
    const fileId = id;
    expect(authDependency.expressAuthentication).toHaveBeenCalledTimes(1);
    expect(response.status).toBe(200);
    expect(userId).toStrictEqual(expectedUserFile.userId);
    expect(fileId).toStrictEqual(expectedUserFile.fileId);
    expect(fileName).toStrictEqual(expectedUserFile.fileName);
    expect(fileSize).toStrictEqual(expectedUserFile.fileSize);
    expect(fileType).toStrictEqual(expectedUserFile.fileType);
    expect(visible).toStrictEqual(expectedUserFile.visible);
    expect(dropDate).toEqual(expectedUserFile.dropDate);
    //Date of no more thant  5 secods ago
    expect(new Date(createdAt).toISOString().split("T")[0]).toEqual(new Date().toISOString().split("T")[0]);
    expect(new Date(updatedAt).toISOString().split("T")[0]).toEqual(new Date().toISOString().split("T")[0]);
  });
  test('WithOutToken_GetUserFiles_Unauthorized', async () => {
    const USERID = "61ad624c-7233-4839-8ece-49fe0e3041ce";

    const response = await request(app).get(`/api/v1/users/${USERID}/files`);
    const bodyResponse = response["body"]

    expect(authDependency.expressAuthentication).toHaveBeenCalledTimes(1);
    expect(response.status).toBe(401);
  });
  test('WithOutRequiredScopes_GetUserFiles_Unauthorized', async () => {
    const scopes : Array<string> = [];
    const USERID = "61ad624c-7233-4839-8ece-49fe0e3041ce";
    const token = JSON.stringify(getTestToken(scopes));

    const response = await request(app).get(`/api/v1/users/${USERID}/files`).
    set('Authorization', `Bearer ${token}`);

    const bodyResponse = response["body"]

    expect(authDependency.expressAuthentication).toHaveBeenCalledTimes(1);
    expect(response.status).toBe(401);
  });
  test('WithRequiredScopesButNotExistenceUserId_GetUserFiles_404', async () => {
    const scopes = ["read:users"];
    const USERID = "61ad624c-7233-4839-8ece-49fe0e3041da";
    const token = JSON.stringify(getTestToken(scopes));

    const response = await request(app).get(`/api/v1/users/${USERID}/files`).
    set('Authorization', `Bearer ${token}`);

    const bodyResponse = response["body"]
    expect(authDependency.expressAuthentication).toHaveBeenCalledTimes(1);
    expect(response.status).toBe(404);
  });
  test('WithRequiredScopesInvalidIdPatter_GetUser_422', async () => {
    const scopes = ["read:users"];
    const userId = 'invalidaidstrucutre';
    const token = JSON.stringify(getTestToken(scopes));

    const response = await request(app).get(`/api/v1/users/${userId}/files`).
    set('Authorization', `Bearer ${token}`);
    const bodyResponse = response["body"]

    expect(authDependency.expressAuthentication).toHaveBeenCalledTimes(1);
    expect(response.status).toBe(422);
  }); 
  /*  POST USER FILE DTO */
  const dtoTests = [
    //wrong fileId pattern 
    {
      "fileId": "be2854fb-9366-5f75-8720-ff8c74e840b",
      "fileName" : "filename", 
      "fileSize": 99999999,
      "fileType": "string",
      "dropDate": "2030-08-22",
      "visible": true
    },
    //wrong fileName data
    {
      "fileId": "be2854fb-9366-5f75-8720-ff8c74e840b0",
      "fileName" : 1234, 
      "fileSize": 99999999,
      "fileType": "string",
      "dropDate": "2030-08-22",
      "visible": true
    },
    //wrong fileSize data
    {
      "fileId": "be2854fb-9366-5f75-8720-ff8c74e840b0",
      "fileName" : "filename", 
      "fileSize": -2,
      "fileType": "string",
      "dropDate": "2030-08-22",
      "visible": true
    },
    //wrong fileType
    {
      "fileId": "be2854fb-9366-5f75-8720-ff8c74e840b0",
      "fileName" : "filename", 
      "fileSize": 1000,
      "fileType": "",
      "dropDate": "2030-08-22",
      "visible": true
    },
    //wrong dropDate
    {
      "fileId": "be2854fb-9366-5f75-8720-ff8c74e840b0",
      "fileName" : "filename", 
      "fileSize": 1000,
      "fileType": "pdf",
      "dropDate": "2030-08-33",
      "visible": true
    },
    //Wrong visible dataType
    {
      "fileId": "be2854fb-9366-5f75-8720-ff8c74e840b0",
      "fileName" : "filename", 
      "fileSize": 1000,
      "fileType": "pdf",
      "dropDate": "2030-08-22",
      "visible": "hallo"
    }
  ];
  /*
  Example wrong value response
      {
      message: 'Validation Failed',
      details: {
        'request.dropDate': {
          message: 'Field does not match date YYYY-MM-DD pattern',
          value: '2030-14-22'
        }
      }
  */
  /* Invalid properties */
  let indexProperty =0;
  test.each(dtoTests)(`Wrong property 422`, async dto => {
    const scopes = ["upload:user-files"]
    const token = JSON.stringify(getTestToken(scopes));
    const dtoKeys = Object.keys(dto);
    const dtoValues = Object.values(dto)
    const keyTofail  = dtoKeys[indexProperty];
    const userId = "6d01953a-794d-5bcd-996d-7bab0d1f2de6";

    const response = await request(app).post(`/api/v1/users/${userId}/files`).send(dto).
    set('Authorization', `Bearer ${token}`);
    const bodyResponse = response["body"];

    expect(bodyResponse["message"]).toEqual('Validation Failed');
    //Just and error because is only a property Wrong

    //IF ONE O MORE PROPERTIES ARE WRONG THIS TEST FAILT WE ARE TESTING ALL PROPERTIES
    expect(Object.keys(bodyResponse["details"]).length).toEqual(1);
    expect(bodyResponse["details"][`request.${keyTofail}`]["message"]).toBeTruthy();
    expect(bodyResponse["details"][`request.${keyTofail}`]["message"]).toBeTruthy();
    expect(bodyResponse["details"][`request.${keyTofail}`]["value"]).toBe(dtoValues[indexProperty])
    expect(authDependency.expressAuthentication).toHaveBeenCalledTimes(1);
    expect(response.status).toBe(422);
    indexProperty++;
  });
  test('WithPermissionAndCorrectValues_UploadUserFile_SuccessResponse', async () => {
    const scopes = ["upload:user-files"]
    const token = JSON.stringify(getTestToken(scopes)); 
    const userId = '61ad624c-7233-4839-8ece-49fe0e3041ce';
    const fileToAdd = {
      fileId : '62ad624c-7233-4839-8ece-49fe0e3041ba',
      fileName : "filename123", 
      fileSize : 10101,
      fileType : "pdf",
      dropDate : "2023-10-06"
    };

    const response = await request(app).post(`/api/v1/users/${userId}/files`).send(fileToAdd).
    set('Authorization', `Bearer ${token}`);
    const bodyResponse = response["body"]

    expect(authDependency.expressAuthentication).toHaveBeenCalledTimes(1);
    expect(response.status).toBe(200);
    expect(bodyResponse.userId).toBe('61ad624c-7233-4839-8ece-49fe0e3041ce');
    expect(bodyResponse.fileId).toBe('62ad624c-7233-4839-8ece-49fe0e3041ba');
    expect(bodyResponse.fileName).toBe("filename123")
    expect(bodyResponse.fileSize).toBe(10101)
    expect(bodyResponse.fileType).toBe("pdf");
    expect(bodyResponse.dropDate).toBe("2023-10-06");
    expect(bodyResponse.visible).toBe(true);
    expect(new Date(bodyResponse.createdAt).toISOString().split("T")[0]).toEqual(new Date().toISOString().split("T")[0]);
    expect(new Date(bodyResponse.updatedAt).toISOString().split("T")[0]).toEqual(new Date().toISOString().split("T")[0]);  
  });
  test('WithPermissionCorrectValuesButInexistenceUser_UploadUserFile_Conflict', async () => {
    const scopes = ["upload:user-files"]
    const token = JSON.stringify(getTestToken(scopes)); 
    const fileToAdd = {
      fileId : '62ad624c-7233-4839-8ece-49fe0e3041ba',
      fileName : "fileName",
      fileSize : 10101,
      fileType : "pdf",
      dropDate : "2023-10-06"
    };
    const userId = '61ad624c-7233-4839-8ece-49fe0e3041ca'

    const response = await request(app).post(`/api/v1/users/${userId}/files`).send(fileToAdd).
    set('Authorization', `Bearer ${token}`);
    const bodyResponse = response["body"]

    expect(authDependency.expressAuthentication).toHaveBeenCalledTimes(1);
    expect(response.status).toBe(409);
    expect(bodyResponse.message).toBe('User not found');
  });
  test('WithPermissionCorrectValuesButFileAlreadyExist_UploadUserFile_Conflict', async () => {
    const scopes = ["upload:user-files"]
    const token = JSON.stringify(getTestToken(scopes)); 
    const userId = '61ad624c-7233-4839-8ece-49fe0e3041ce';
    const fileToAdd = {
      fileId : '62ad624c-7233-4839-8ece-49fe0e3041ce',
      fileName : "fileName",
      fileSize : 10101,
      fileType : "pdf",
      dropDate : "2023-10-06"
    };

    const response = await request(app).post(`/api/v1/users/${userId}/files`).send(fileToAdd).
    set('Authorization', `Bearer ${token}`);
    const bodyResponse = response["body"]

    expect(authDependency.expressAuthentication).toHaveBeenCalledTimes(1);
    expect(bodyResponse.message).toEqual(`File with id ${fileToAdd.fileId} already exists`)
    expect(response.status).toBe(409);
  });
  test('WithOutToken_UploadUserFile_UnAuthorized', async () => {
    const userId = '61ad624c-7233-4839-8ece-49fe0e3041ce';
    const fileToAdd = {
      fileId : '62ad624c-7233-4839-8ece-49fe0e3041ce',
      fileName : "fileName",
      fileSize : 10101,
      fileType : "pdf",
      dropDate : "2023-10-06"
    };

    const response = await request(app).post(`/api/v1/users/${userId}/files`).send(fileToAdd);

    expect(authDependency.expressAuthentication).toHaveBeenCalledTimes(1);
    expect(response.status).toBe(401);
  });
  test('WithTokenButNotPermissions_UploadUserFile_UnAuthorized', async () => {
    const scopes = ["read:users"]
    const token = JSON.stringify(getTestToken(scopes)); 
    const userId = '61ad624c-7233-4839-8ece-49fe0e3041ce';
    const fileToAdd = {
      fileId : '62ad624c-7233-4839-8ece-49fe0e3041ce',
      fileName : "fileName",
      fileSize : 10101,
      fileType : "pdf",
      dropDate : "2023-10-06"
    };

    const response = await request(app).post(`/api/v1/users/${userId}/files`).send(fileToAdd).
    set('Authorization', `Bearer ${token}`);

    expect(authDependency.expressAuthentication).toHaveBeenCalledTimes(1);
    expect(response.status).toBe(401);
  });
  //ENDPOINT CREATE USER
  test('WithOutToken_CreatUser_UnAuthorized', async () => {
    const userToAdd = {
      email: "fake.email@gmail.com",
      emailVerified: false,
      authId: "authId|123456",
      name: "fake",
      lastName: "user",
      picture: "http://localhost:4000/api/v1/users-api/image.jpg",
      secondLastName: null,
      age: 20,
      address: null
    };

    const response = await request(app).post(`/api/v1/users`).send(userToAdd);

    expect(authDependency.expressAuthentication).toHaveBeenCalledTimes(1);
    expect(response.status).toBe(401);
  });
  test('WithTokenButNotPermissions_CreateUser_UnAuthorized', async () => {
    const scopes = ["fake:scope"]
    const token = JSON.stringify(getTestToken(scopes)); 
    const userToAdd = {
      email: "fake.email@gmail.com",
      emailVerified: false,
      authId: "authId|123456",
      name: "fake",
      lastName: "user",
      picture: "http://localhost:4000/api/v1/users-api/image.jpg",
      secondLastName: null,
      age: 20,
      address: null
    }

    const response = await request(app).post(`/api/v1/users`).send(userToAdd).
    set('Authorization', `Bearer ${token}`);

    expect(authDependency.expressAuthentication).toHaveBeenCalledTimes(1);
    expect(response.status).toBe(401);
  });
  test('WithCorrectValuesAndAuth_CreateUser_UserCreated', async () => {
    const scopes = ["create:profiles"]
    const token = JSON.stringify(getTestToken(scopes)); 
    const userToAdd = {
      email: "fake.email@gmail.com",
      emailVerified: false,
      authId: "authId|123456",
      name: "fake",
      lastName: "user",
      picture: "http://localhost:4000/api/v1/users-api/image.jpg",
      secondLastName: null,
      age: 20,
      address: null
    }

    const response = await request(app).post(`/api/v1/users`).send(userToAdd).
    set('Authorization', `Bearer ${token}`);
    const body : CreateUserResponseDto = response["body"];

    expect(authDependency.expressAuthentication).toHaveBeenCalledTimes(1);
    expect(response.status).toBe(200);
    expect(body.email).toStrictEqual(userToAdd.email);
    expect(body.status).toStrictEqual("success");
    expect(body.id).toBeTruthy();

  });
  /* Already changed a user can have multiple account with same email */
  /* test('WithEmailInDb_CreateUser_Conflict', async () => {
    const scopes = ["create:profiles"]
    const token = JSON.stringify(getTestToken(scopes)); 
    //email alredy in db in beforeall section
    const userToAdd = {
      email: "emailtests@gmail.com",
      emailVerified: false,
      authId: "authId|654321",
      name: "fake",
      lastName: "user",
      picture: "http://localhost:4000/api/v1/users-api/image.jpg",
      secondLastName: null,
      age: 20,
      address: null
    }

    const response = await request(app).post(`/api/v1/users`).send(userToAdd).
    set('Authorization', `Bearer ${token}`);
    //const body : CreateUserResponseDto = response["body"];

    expect(authDependency.expressAuthentication).toHaveBeenCalledTimes(1);
    expect(response.status).toBe(409);

  }); */
  test('WithAuthId_CreateUser_Conflict', async () => {
    const scopes = ["create:profiles"]
    const token = JSON.stringify(getTestToken(scopes)); 
    //auth id already in db
    const userToAdd = {
      email: "emailtests1234@gmail.com",
      emailVerified: false,
      authId: "61ad624c-7233-4839-8ece-49fe0e3041ce",
      name: "fake",
      lastName: "user",
      picture: "http://localhost:4000/api/v1/users-api/image.jpg",
      secondLastName: null,
      age: 20,
      address: null
    }

    const response = await request(app).post(`/api/v1/users`).send(userToAdd).
    set('Authorization', `Bearer ${token}`);

    expect(authDependency.expressAuthentication).toHaveBeenCalledTimes(1);
    expect(response.status).toBe(409);

  });
  /*  POST USER dto :: Some values can be null but no other types different to predestinated:: */
  /* SOME VALUES ARE REQUIRED AND CAN NOT BE TESTED AS NULL, MIDDLEWARE DELETES NULL VALUES */
  const dtoCreateUser = [
    //wrong email
    {
      email: "emailtests1234gmail.com",
      emailVerified: false,
      authId: "61ad624c-7233-4839-8ece-49fe0e3041ce",
      name: "fake",
      lastName: "user",
      picture: "http://localhost:4000/api/v1/users-api/image.jpg",
      secondLastName: null,
      age: 20,
      address: null
    },
    //wrong emailVerfied pattern 
    {
      email: "emailtests1234@gmail.com",
      emailVerified: "right",
      authId: "61ad624c-7233-4839-8ece-49fe0e3041ce",
      name: "fake",
      lastName: "user",
      picture: "http://localhost:4000/api/v1/users-api/image.jpg",
      secondLastName: null,
      age: 20,
      address: null
    },
    //wrong authid
    {
      email: "emailtests1234@gmail.com",
      emailVerified: false,
      authId: 123456,
      name: "fake",
      lastName: "user",
      picture: "http://localhost:4000/api/v1/users-api/image.jpg",
      secondLastName: null,
      age: 20,
      address: null
    },
    //wrong name 
    {
      email: "emailtests1234@gmail.com",
      emailVerified: false,
      authId: "61ad624c-7233-4839-8ece-49fe0e3041ce",
      name: 12345,
      lastName: "user",
      picture: "http://localhost:4000/api/v1/users-api/image.jpg",
      secondLastName: null,
      age: 20,
      address: null
    },
    //wrong lastNAME
    {
      email: "emailtests1234@gmail.com",
      emailVerified: false,
      authId: "61ad624c-7233-4839-8ece-49fe0e3041ce",
      name: "User",
      lastName: 123456,
      picture: "http://localhost:4000/api/v1/users-api/image.jpg",
      secondLastName: null,
      age: 20,
      address: null
    },
    //wrong picture
    {
      email: "emailtests@gmail.com",
      emailVerified: false,
      authId: "authId|654321",
      name: "fake",
      lastName: "user",
      picture: 123456,
      secondLastName: null,
      age: 20,
      address: null
    },
    //wrong second last name
    {
      email: "emailtests@gmail.com",
      emailVerified: false,
      authId: "authId|654321",
      name: "fake",
      lastName: "user",
      picture: "http://localhost:4000/api/v1/users-api/image.jpg",
      secondLastName: 12345,
      age: 20,
      address: null
    },
    //wrong age
    {
      email: "emailtests@gmail.com",
      emailVerified: false,
      authId: "authId|654321",
      name: "fake",
      lastName: "user",
      picture: "http://localhost:4000/api/v1/users-api/image.jpg",
      secondLastName: null,
      age: 150,
      address: null
    },
    //wrong address 
    {
      email: "emailtests@gmail.com",
      emailVerified: false,
      authId: "authId|654321",
      name: "fake",
      lastName: "user",
      picture: "http://localhost:4000/api/v1/users-api/image.jpg",
      secondLastName: null,
      age: 20,
      address: 22312
    }

  ];
  let indexPropertyCreateUser = 0;
  test.each(dtoCreateUser)(`Wrong property at create user 422`, async dto => {
    const scopes = ["create:profiles"]
    const token = JSON.stringify(getTestToken(scopes));
    const dtoKeys = Object.keys(dto);
    const dtoValues = Object.values(dto)
    const keyTofail  = dtoKeys[indexPropertyCreateUser];

    const response = await request(app).post(`/api/v1/users`).send(dto).
    set('Authorization', `Bearer ${token}`);
    const bodyResponse = response["body"];

    expect(bodyResponse["message"]).toEqual('Validation Failed');
    //Just and error because is only a property Wrong

    //IF ONE O MORE PROPERTIES ARE WRONG THIS TEST FAILT WE ARE TESTING ALL PROPERTIES
    expect(Object.keys(bodyResponse["details"]).length).toEqual(1);
    expect(bodyResponse["details"][`request.${keyTofail}`]["message"]).toBeTruthy();
    expect(bodyResponse["details"][`request.${keyTofail}`]["message"]).toBeTruthy();
    expect(bodyResponse["details"][`request.${keyTofail}`]["value"]).toBe(dtoValues[indexPropertyCreateUser])
    expect(authDependency.expressAuthentication).toHaveBeenCalledTimes(1);
    expect(response.status).toBe(422);
    indexPropertyCreateUser++;
  });

  //ENDPOINT PATCH USER
  test('WithOutToken_PatchUser_UnAuthorized', async () => {
    const userId = '31ad624c-7233-4839-8ece-49fe0e3041ce';
    const userToPatch = {
      emailVerified: true,
      name: "new",
      lastName: "patched",
      picture: "http://localhost:4000/api/v1/users-api/image.jpg",
      secondLastName: "second",
      age: 20,
      address: "string"
    }

    const response = await request(app).patch(`/api/v1/users/${userId}`).send(userToPatch);

    expect(authDependency.expressAuthentication).toHaveBeenCalledTimes(1);
    expect(response.status).toBe(401);
  });
  test('WithTokenButNotPermissions_PatchUser_UnAuthorized', async () => {
    const scopes = ["fake:scope"]
    const token = JSON.stringify(getTestToken(scopes)); 
    const userId = '31ad624c-7233-4839-8ece-49fe0e3041ce';
    const userToPatch = {
      emailVerified: true,
      name: "new",
      lastName: "patched",
      picture: "http://localhost:4000/api/v1/users-api/image.jpg",
      secondLastName: "second",
      age: 20,
      address: "string"
    }

    const response = await request(app).patch(`/api/v1/users/${userId}`).send(userToPatch).
    set('Authorization', `Bearer ${token}`);

    expect(authDependency.expressAuthentication).toHaveBeenCalledTimes(1);
    expect(response.status).toBe(401);
  });
  test('WithAuthButNotExistenceUser_PatchUser_UnAuthorized', async () => {
    const scopes = ["create:profiles"]
    const token = JSON.stringify(getTestToken(scopes)); 
    const userId = '31ad624c-7233-4839-8ece-49fe0e3041ca';
    const userToPatch = {
      emailVerified: true,
      name: "new",
      lastName: "patched",
      picture: "http://localhost:4000/api/v1/users-api/image.jpg",
      secondLastName: "second",
      age: 20,
      address: "string"
    }

    const response = await request(app).patch(`/api/v1/users/${userId}`).send(userToPatch).
    set('Authorization', `Bearer ${token}`);

    expect(authDependency.expressAuthentication).toHaveBeenCalledTimes(1);
    expect(response.status).toBe(404);
  });
  test('WithAuthAndUserId_PatchUser_PatchedFullyAllowedProperties', async () => {
    const scopes = ["create:profiles"]
    const token = JSON.stringify(getTestToken(scopes)); 
    const userId = '31ad624c-7233-4839-8ece-49fe0e3041ce';
    const userToPatch = {
      emailVerified: false,
      name: "newnametest1",
      lastName: "patchednew1",
      picture: "http://localhost:4000/api/v1/users-api/imagetest1234.jpg",
      secondLastName: "secondpatchednew1",
      age: 50,
      address: "new address"
    }

    const response = await request(app).patch(`/api/v1/users/${userId}`).send(userToPatch).
    set('Authorization', `Bearer ${token}`);
    const body = response["body"];

    expect(authDependency.expressAuthentication).toHaveBeenCalledTimes(1);
    expect(response.status).toBe(200);
    expect(body.id).toBeTruthy();
    expect(body.email).toBeTruthy();
    expect(body.authId).toBeTruthy();
    expect(body.emailVerified).toStrictEqual(userToPatch.emailVerified);
    expect(body.name).toStrictEqual(userToPatch.name);
    expect(body.lastName).toStrictEqual(userToPatch.lastName);
    expect(body.picture).toStrictEqual(userToPatch.picture);
    expect(body.secondLastName).toStrictEqual(userToPatch.secondLastName);
    expect(body.age).toStrictEqual(userToPatch.age);
    expect(body.address).toStrictEqual(userToPatch.address);
});
  const patchUserSinglePropertyDtos = [
    {
      emailVerified: true
    },
    {
      name: "randomname"
    },
    {
      lastName: "randomlastname",
    },
    {
      picture : "http://localhost:4000/api/v1/local/image.jpg"
    },
    {
      secondLastName : "randomsecond"
    },
    {
      age : 50
    },
    {
      address : "random adress"
    }
  ]
  test.each(patchUserSinglePropertyDtos)(`Patch single property`, async dto => {  
    const scopes = ["create:profiles"]
    const token = JSON.stringify(getTestToken(scopes)); 
    const userId = '31ad624c-7233-4839-8ece-49fe0e3041ce'
    const [expectedKey, expectedValue] = Object.entries(dto)[0];

    const response = await request(app).patch(`/api/v1/users/${userId}`).send(dto).
    set('Authorization', `Bearer ${token}`);
    const body = response["body"];

    expect(body.id).toBeTruthy();
    expect(body.email).toBeTruthy();
    expect(body.authId).toBeTruthy();
    expect(authDependency.expressAuthentication).toHaveBeenCalledTimes(1);
    expect(response.status).toBe(200);
    expect(body[expectedKey]as any).toStrictEqual(expectedValue);
  });
  const patchSingleWrongPropertiesDtos = [
    {
      emailVerified: "right"
    },
    {
      name: 1234
    },
    {
      lastName: 123456,
    },
    {
      picture : 123213421
    },
    {
      secondLastName : 1231321
    },
    {
      age : 150
    },
    {
      address : 12354
    }
  ]
  test.each(patchSingleWrongPropertiesDtos)(`Patch single property verify values`, async dto => {
    const scopes = ["create:profiles"]
    const token = JSON.stringify(getTestToken(scopes)); 
    const userId = '31ad624c-7233-4839-8ece-49fe0e3041ce'
    const [expectedKey, expectedWrongValue] = Object.entries(dto)[0];

    const response = await request(app).patch(`/api/v1/users/${userId}`).send(dto).
    set('Authorization', `Bearer ${token}`);
    const bodyResponse = response["body"];

    expect(Object.keys(bodyResponse["details"]).length).toEqual(1);
    expect(bodyResponse["details"][`request.${expectedKey}`]["message"]).toBeTruthy();
    expect(bodyResponse["details"][`request.${expectedKey}`]["message"]).toBeTruthy();
    expect(bodyResponse["details"][`request.${expectedKey}`]["value"]).toBe(expectedWrongValue)
    expect(authDependency.expressAuthentication).toHaveBeenCalledTimes(1);
    expect(response.status).toBe(422);
  });
  //ENDPOINT DELETE USER FILE
  test('WithOutToken_DeleteUserFile_UnAuthorized', async () => {
    const userId = '61ad624c-7233-4839-8ece-49fe0e3041ce';
    const fileId = '62ad624c-7233-4839-8ece-49fe0e3041ba'

    const response = await request(app).delete(`/api/v1/users/${userId}/files/${fileId}`);

    expect(authDependency.expressAuthentication).toHaveBeenCalledTimes(1);
    expect(response.status).toBe(401);
  });
  test('WithTokenButNotPermissions_DeleteUserFile_UnAuthorized', async () => {
    const scopes = ["fake:scope"]
    const token = JSON.stringify(getTestToken(scopes)); 
    const userId = '61ad624c-7233-4839-8ece-49fe0e3041ce';
    const fileId = '62ad624c-7233-4839-8ece-49fe0e3041ba'

    const response = await request(app).delete(`/api/v1/users/${userId}/files/${fileId}`).
    set('Authorization', `Bearer ${token}`);

    expect(authDependency.expressAuthentication).toHaveBeenCalledTimes(1);
    expect(response.status).toBe(401);
  });
  test('WithCorrectValuesAndAuth_DeleteUserFile_FileDeleted', async () => {
    const scopes = ["upload:user-files"]
    const token = JSON.stringify(getTestToken(scopes)); 
    const userid = '61ad624c-7233-4839-8ece-49fe0e3041ce';
    const fileId = '62ad624c-7233-4839-9ece-49fe0e3041ce'

    const response = await request(app).delete(`/api/v1/users/${userid}/files/${fileId}`).
    set('Authorization', `Bearer ${token}`);

    expect(authDependency.expressAuthentication).toHaveBeenCalledTimes(1);
    expect(response.status).toBe(200);
  });
  test('WithAuthButNotUserInDb_DeleteUserFile_NotFound', async () => {
    const scopes = ["upload:user-files"]
    const token = JSON.stringify(getTestToken(scopes)); 
    const userid = '61ad624c-7233-4839-8ece-49fe0e3041ba';
    const fileId = '62ad624c-7233-4839-9ece-49fe0e3041ce'

    const response = await request(app).delete(`/api/v1/users/${userid}/files/${fileId}`).
    set('Authorization', `Bearer ${token}`);

    expect(authDependency.expressAuthentication).toHaveBeenCalledTimes(1);
    expect(response.status).toBe(404);
  });
  test('WithAuthButNotFileInDb_DeleteUserFile_NotFound', async () => {
    const scopes = ["upload:user-files"]
    const token = JSON.stringify(getTestToken(scopes)); 
    const userid = '29ad624c-7233-4839-8ece-49fe0e3041ce';
    const fileId = '62ad624c-7233-4839-8ece-49fe0e3041be'

    const response = await request(app).delete(`/api/v1/users/${userid}/files/${fileId}`).
    set('Authorization', `Bearer ${token}`);

    expect(authDependency.expressAuthentication).toHaveBeenCalledTimes(1);
    expect(response.status).toBe(404);
  });
  
  test(`Wrong property userid 422`, async () => {
    const scopes = ["upload:user-files"]
    const token = JSON.stringify(getTestToken(scopes)); 
    const userId = '1234-12313213-213123213-1231';
    const fileId = '62ad624c-7233-4839-8ece-49fe0e3041be'

    const response = await request(app).delete(`/api/v1/users/${userId}/files/${fileId}`).
    set('Authorization', `Bearer ${token}`);
    const bodyResponse = response["body"];
    expect(bodyResponse["message"]).toEqual('Validation Failed');
    //Just and error because is only a property Wrong
    //IF ONE O MORE PROPERTIES ARE WRONG THIS TEST FAILT WE ARE TESTING ALL PROPERTIES
    expect(Object.keys(bodyResponse["details"]).length).toEqual(1);
    expect(bodyResponse["details"][`userId`]["message"]).toBeTruthy();
    expect(bodyResponse["details"][`userId`]["message"]).toBeTruthy();
    expect(bodyResponse["details"][`userId`]["value"]).toBe(userId)
    expect(authDependency.expressAuthentication).toHaveBeenCalledTimes(1);
    expect(response.status).toBe(422);
  });
  test(`Wrong property userid 422`, async () => {
    const scopes = ["upload:user-files"]
    const token = JSON.stringify(getTestToken(scopes)); 
    const fileId = '1234-12313213-213123213-1231';
    const userId = '62ad624c-7233-4839-8ece-49fe0e3041be'

    const response = await request(app).delete(`/api/v1/users/${userId}/files/${fileId}`).
    set('Authorization', `Bearer ${token}`);
    const bodyResponse = response["body"];

    expect(bodyResponse["message"]).toEqual('Validation Failed');
    //Just and error because is only a property Wrong
    //IF ONE O MORE PROPERTIES ARE WRONG THIS TEST FAILT WE ARE TESTING ALL PROPERTIES
    expect(Object.keys(bodyResponse["details"]).length).toEqual(1);
    expect(bodyResponse["details"][`fileId`]["message"]).toBeTruthy();
    expect(bodyResponse["details"][`fileId`]["message"]).toBeTruthy();
    expect(bodyResponse["details"][`fileId`]["value"]).toBe(fileId)
    expect(authDependency.expressAuthentication).toHaveBeenCalledTimes(1);
    expect(response.status).toBe(422);
  });
  //ENDPOINT PATCH USERFILE
  test('WithOutToken_PatchUserFile_UnAuthorized', async () => {
    const userId = "61ad624c-7233-4839-8ece-49fe0e3041ce";
    const fileId = "82ad624c-7233-4839-8ece-49fe0e3041ce";
    const updateUserFileDto : PatchUserFileRequestDto = {
      "fileName": "updatedfilename",
      "fileSize": 2000,
      "fileType": "txt",
      "dropDate": "2025-08-30",
      "visible": true
    }

    const response = await request(app).patch(`/api/v1/users/${userId}/files/${fileId}`).send(updateUserFileDto);

    expect(authDependency.expressAuthentication).toHaveBeenCalledTimes(1);
    expect(response.status).toBe(401);
  });
  test('WithTokenButNotPermissions_PatchUserFile_UnAuthorized', async () => {
    const scopes = ["fake:scope"]
    const token = JSON.stringify(getTestToken(scopes)); 
    const userId = "61ad624c-7233-4839-8ece-49fe0e3041ce";
    const fileId = "82ad624c-7233-4839-8ece-49fe0e3041ce";
    const updateUserFileDto : PatchUserFileRequestDto = {
      "fileName": "updatedfilename",
      "fileSize": 2000,
      "fileType": "txt",
      "dropDate": "2025-08-30",
      "visible": true
    }

    const response = await request(app).patch(`/api/v1/users/${userId}/files/${fileId}`).send(updateUserFileDto).
    set('Authorization', `Bearer ${token}`);

    expect(authDependency.expressAuthentication).toHaveBeenCalledTimes(1);
    expect(response.status).toBe(401);
  });
  test('WithAuthButNotExistenceUser_PatchUserFile_NotFound', async () => {
    const scopes = ["upload:user-files"]
    const token = JSON.stringify(getTestToken(scopes)); 
    const userId = "51ad624c-7233-4839-8ece-49fe0e3041ce";
    const fileId = "82ad624c-7233-4839-8ece-49fe0e3041ce";
    const updateUserFileDto : PatchUserFileRequestDto = {
      "fileName": "updatedfilename",
      "fileSize": 2000,
      "fileType": "txt",
      "dropDate": "2025-08-30",
      "visible": true
    }

    const response = await request(app).patch(`/api/v1/users/${userId}/files/${fileId}`).send(updateUserFileDto).
    set('Authorization', `Bearer ${token}`);

    expect(authDependency.expressAuthentication).toHaveBeenCalledTimes(1);
    expect(response.status).toBe(404);
  });
  test('WithAuthAndUserId_PatchUserFile_PatchedFullyAllowedProperties', async () => {
    const scopes = ["upload:user-files"]
    const token = JSON.stringify(getTestToken(scopes)); 
    const userId = "61ad624c-7233-4839-8ece-49fe0e3041ce";
    const fileId = "82ad624c-7233-4839-8ece-49fe0e3041ce";
    const updateUserFileDto : PatchUserFileRequestDto = {
      "fileName": "updatedfilename",
      "fileSize": 2000,
      "fileType": "txt",
      "dropDate": "2025-08-30",
      "visible": true
    }

    const response = await request(app).patch(`/api/v1/users/${userId}/files/${fileId}`).send(updateUserFileDto).
    set('Authorization', `Bearer ${token}`);

    const body = response["body"];

    expect(authDependency.expressAuthentication).toHaveBeenCalledTimes(1);
    expect(response.status).toBe(200);
    expect(body.id).toBeTruthy();
    expect(body.fileName).toStrictEqual(updateUserFileDto.fileName);
    expect(body.fileSize).toStrictEqual(updateUserFileDto.fileSize);
    expect(body.dropDate).toStrictEqual(updateUserFileDto.dropDate);
    expect(body.visible).toStrictEqual(updateUserFileDto.visible);
    expect(body.createdAt).toBeTruthy();
    expect(body.updatedAt).toBeTruthy;

  });
  const patchUserFileSinglePropertyDtos = [
    {
      fileName: "filechanged"
    },
    {
      fileSize : 55555
    },
    {
      fileType: "docx",
    },
    {
      dropDate : "2025-09-23"
    },
    {
      visible : true
    }
  ]
  test.each(patchUserFileSinglePropertyDtos)(`Patch single property`, async dto => {  
    const scopes = ["upload:user-files"]
    const token = JSON.stringify(getTestToken(scopes)); 
    const userId = "61ad624c-7233-4839-8ece-49fe0e3041ce";
    const fileId = "82ad624c-7233-4839-8ece-49fe0e3041ce";

    const [expectedKey, expectedValue] = Object.entries(dto)[0];

    const response = await request(app).patch(`/api/v1/users/${userId}/files/${fileId}`).send(dto).
    set('Authorization', `Bearer ${token}`);
    
    const body = response["body"];

    expect(authDependency.expressAuthentication).toHaveBeenCalledTimes(1);
    expect(response.status).toBe(200);
    expect(body.id).toBeTruthy();
    expect(body[expectedKey]as any).toStrictEqual(expectedValue);
    expect(body.createdAt).toBeTruthy();
    expect(body.updatedAt).toBeTruthy;
  });
  const patchWronUserFileSinglePropertyDtos = [
    {
      fileName: 12314123
    },
    {
      fileSize : "hello world"
    },
    {
      fileType: 321312312,
    },
    {
      dropDate : 20250923
    },
    {
      visible : "no"
    }
  ]
  test.each(patchWronUserFileSinglePropertyDtos)(`Patch userfile if verifying values`, async dto => {
    const scopes = ["upload:user-files"];
    const token = JSON.stringify(getTestToken(scopes)); 
    const userId = "61ad624c-7233-4839-8ece-49fe0e3041ce";
    const fileId = "82ad624c-7233-4839-8ece-49fe0e3041ce";
    const [expectedKey, expectedWrongValue] = Object.entries(dto)[0];

    const response = await request(app).patch(`/api/v1/users/${userId}/files/${fileId}`).send(dto).
    set('Authorization', `Bearer ${token}`);
    const bodyResponse = response["body"];

    expect(Object.keys(bodyResponse["details"]).length).toEqual(1);
    expect(bodyResponse["details"][`request.${expectedKey}`]["message"]).toBeTruthy();
    expect(bodyResponse["details"][`request.${expectedKey}`]["message"]).toBeTruthy();
    expect(bodyResponse["details"][`request.${expectedKey}`]["value"]).toBe(expectedWrongValue)
    expect(authDependency.expressAuthentication).toHaveBeenCalledTimes(1);
    expect(response.status).toBe(422);
  });
  //ENDPOINT RENEW SERVICES

  test('WithAuthentication_renewBeatenServices_Success', async () => {

    const scopes = ["global:users"];
    const token = JSON.stringify(getTestToken(scopes)); 

    const response = await request(app).post(`/api/v1/users/cron`).
    set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
  });
  
  test('WithoutAuthentication_renewBeatenServices_Forbidden', async () => {

    const scopes = ["fake:scope"];
    const token = JSON.stringify(getTestToken(scopes)); 

    const response = await request(app).post(`/api/v1/users/cron`).
    set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(401);
  });

  describe("Mocking and error in userservice", ()=>{
    let update: jest.SpyInstance<Promise<void>, [], any>;
    beforeAll(async()=>{
      update = jest.spyOn(iocContainer.get<UserServiceInterface>(TYPES.UserServiceInterface),"updateBeatenSubscriptions");
      update.mockImplementation(() => {
        throw new Error("Update in db error at update users subscriptions");
      });
      // If error happens in subscriptions, update to user files must still running 
      let todayLess2Days = addDays(new Date(), -2);
      const userToAdd = {
        id : 'f61762bb-38b7-4611-837f-1db2116b6df9',
        authId : 'f61762bb-38b7-4611-837f-1db2116b6df9',
        email : "emailtests@gmail.com",
        emailVerified : true, 
        picture : "pictureUrl",
        name: 'John',
        lastName: 'Doe',
        secondLastName: 'Doe2',
        age : 50, 
        address : "Address example"
      }
      const fileToAdd = {
        userId : "f61762bb-38b7-4611-837f-1db2116b6df9",
        fileId : "f61762bb-38b7-4611-837f-1db2116b6df9",
        fileName : "fileName",
        fileSize : 10101,
        fileType : "pdf",
        dropDate : todayLess2Days.toISOString().split("T")[0],
        visible : true, 
        createdAt : new Date(),
        updatedAt : new Date()
      }
      await User.create(userToAdd);
      await UserFiles.create(fileToAdd);
    });
    afterAll(async ()=>{
      update.mockRestore();
        await UserFiles.destroy({where: {fileId : "f61762bb-38b7-4611-837f-1db2116b6df9"}});
        await User.destroy({where: {id : "f61762bb-38b7-4611-837f-1db2116b6df9"}});
    })
    test('WithAuthenticationButDbErrorUdp_renewBeatenServices_Conflict-Subscritions-', async () => {
      const errorReturned = "Update in db error at update users subscriptions"
      const scopes = ["global:users"];
      const token = JSON.stringify(getTestToken(scopes)); 
  
      const response = await request(app).post(`/api/v1/users/cron`).
      set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(409);
      expect(response.body.message).toBe(errorReturned)
    });
    test('CronTaks_ErrorAtUpdateUserSubscriptions_SameWayUserFilesUpdated', async () => {
      const errorReturned = "Update in db error at update users subscriptions"
      const scopesToGetUserFiles = ["read:users"];
      const scopesToCron = ["global:users"];
      const token = JSON.stringify(getTestToken(scopesToCron)); 
      const tokenUserfiles = JSON.stringify(getTestToken(scopesToGetUserFiles)); 
  
      const response = await request(app).post(`/api/v1/users/cron`).
      set('Authorization', `Bearer ${token}`);
      const userFiles = await request(app).get(`/api/v1/users/f61762bb-38b7-4611-837f-1db2116b6df9/files`).
      set('Authorization', `Bearer ${tokenUserfiles}`);
      const fileUpdated = userFiles.body.files[0];

      expect(fileUpdated.visible).toBe(false);
      expect(userFiles.status).toBe(200);
      expect(response.status).toBe(409);
      expect(response.body.message).toBe(errorReturned)
    });
  })
  describe("Mocking certain parts of userService", ()=>{
    let update: jest.SpyInstance<Promise<void>, [], any>;
    beforeAll(async()=>{
      update = jest.spyOn(iocContainer.get<UserServiceInterface>(TYPES.UserServiceInterface),"updateBeatenTemporalyFiles");
      update.mockImplementation(() => {
        throw new Error("Error in db at update user files");
      });
      let todayLess2Days = addDays(new Date(), -2);
      const userToAdd = {
        id : 'f61762bb-38b7-4611-837f-1db2116b6df9',
        authId : 'f61762bb-38b7-4611-837f-1db2116b6df9',
        email : "emailtests@gmail.com",
        emailVerified : true, 
        picture : "pictureUrl",
        name: 'John',
        lastName: 'Doe',
        secondLastName: 'Doe2',
        age : 50, 
        address : "Address example"
      }
      const subscription = {
        id:"e61762bb-38b7-4611-837f-1db2116b6df9",
        userId : "f61762bb-38b7-4611-837f-1db2116b6df9",
        customerId : "f61762bb-38b7",
        description:"PLUS",
        renewDate : todayLess2Days.toISOString().split("T")[0]
      }
      await User.create(userToAdd);
      await UserSubscriptions.create(subscription);
    });
    afterAll(async()=>{
      update.mockRestore();
      await UserSubscriptions.destroy({where:{id:"e61762bb-38b7-4611-837f-1db2116b6df9"}});
      await User.destroy({where:{id:"f61762bb-38b7-4611-837f-1db2116b6df9"}});
    })
    test('WithAuthenticationButDbErrorUdp_renewBeatenServices_Conflict-TemporalyFiles-', async () => {
      const errorReturned = "Error in db at update user files";
      const scopes = ["global:users"];
      const token = JSON.stringify(getTestToken(scopes)); 
  
      const response = await request(app).post(`/api/v1/users/cron`).
      set('Authorization', `Bearer ${token}`);
  
      expect(response.status).toBe(409);
      expect(response.body.message).toContain(errorReturned)
    });
    test('CronTaks_ErrorAtUpdateUserFiles_SameWayUserSubscriptionUpdated', async () => {
      const errorReturned = "Error in db at update user files"
      const scopesToGetUserFiles = ["read:users"];
      const scopesToCron = ["global:users"];
      const token = JSON.stringify(getTestToken(scopesToCron)); 
      const tokenUserSubscriptions = JSON.stringify(getTestToken(scopesToGetUserFiles)); 
  
      const response = await request(app).post(`/api/v1/users/cron`).
      set('Authorization', `Bearer ${token}`);
      const userSubscriptions = await request(app).get(`/api/v1/users/f61762bb-38b7-4611-837f-1db2116b6df9/subscriptions`).
      set('Authorization', `Bearer ${tokenUserSubscriptions}`);
      const subscripionUpdated = userSubscriptions.body[0];

      expect(response.status).toBe(409);
      expect(response.body.message).toBe(errorReturned)
      expect(subscripionUpdated.description).toBe("Free");
      expect(userSubscriptions.status).toBe(200);

    });

  })

});
