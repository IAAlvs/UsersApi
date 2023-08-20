
import { sequelize } from "../../../../src/database/sequelize.config";
import { User } from "../../../../src/api/models/user";
import { UserFiles } from "../../../../src/api/models/user-file";
import { UserServiceInterface } from "@/api/interfaces/UserServiceInterface";
import { iocContainer } from "../../../../src/api/aspects/inversify.config";
import TYPES from "../../../../src/api/interfaces/ServiceTypes";
import { CreateUserRequestDto, GetUserFilesDtoResponse, GetUserResponseDto, PostUserFileRequestDto } from "../../../../src/api/dtos/UserDtos";
import { PatchUserRequestDto } from "../../../../src/api/dtos/UserDtos"

let _userService : UserServiceInterface;
const datesAreEqualWithinRange = (date1: Date, date2 : Date) => {
  const differenceInSeconds = Math.abs(date1.getTime() - date2.getTime()) / 1000;
  return differenceInSeconds <= 100;
};
describe('User Service Tests', () => {
  beforeAll(async () =>{
    //Change environment to tests
    _userService= iocContainer.get<UserServiceInterface>(TYPES.UserServiceInterface);
    await sequelize.sync({ force: true });
  },5000)
  
  beforeEach(async () =>{
    const userToAdd = {
      id : '61ad624c-7233-4839-8ece-49fe0e3041ce',
      authId : '61ad624c-7233-4839-8ece-49fe0e3041ce',
      email : "emailtests@gmail.com",
      emailVerified : true,
      picture : "pictureurl",
      name: 'John',
      lastName: 'Doe',
      secondLastName: 'Doe2',
      age : 50, 
      address : "Address example"
    }
    const userToAdd2 = {
      id : '61ad624c-7233-4839-8ece-49fe0e3041be',
      authId : '61ad624c-7233-4839-8ece-49fe0e3041le',
      email : "email2tests@gmail.com",
      emailVerified : true,
      picture : "pictureurl",
      name: 'Jue',
      lastName: 'Roe',
      secondLastName: 'Poe',
      age : 22, 
      address : "Address example"
    }
    
    // '61ad624c-7233-4839-8ece-49fe0e3041be'
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
    await User.create(userToAdd);
    await User.create(userToAdd2);
    await UserFiles.create(fileToAdd);
  });
  afterEach(async() =>{
    await UserFiles.destroy({where: {userId : '61ad624c-7233-4839-8ece-49fe0e3041ce'}});
    await UserFiles.destroy({where: {fileId : '62ad624c-7233-4839-8ece-49fe0e3042ce'}})
    await User.destroy({where: {id : '61ad624c-7233-4839-8ece-49fe0e3041ce'}});
    await User.destroy({where: {id : '61ad624c-7233-4839-8ece-49fe0e3041be'}});
  });
  test("WithExistenceUserId_GetUser_User", async () =>{
    const userId = '61ad624c-7233-4839-8ece-49fe0e3041ce';
    const expectedUser : GetUserResponseDto = {
      id : '61ad624c-7233-4839-8ece-49fe0e3041ce',
      authId : '61ad624c-7233-4839-8ece-49fe0e3041ce',
      email : "emailtests@gmail.com",
      emailVerified : true,
      picture : "pictureurl",
      name: 'John',
      lastName: 'Doe',
      secondLastName: 'Doe2',
      age : 50, 
      address : "Address example",
      createdAt : new Date(),
      updatedAt : new Date()
    };

    const response = await _userService.getUser(userId)!;
    if(!response)
      throw new Error("Null response");

    expect(response.id).toEqual(expectedUser.id);
    expect(response.authId).toEqual(expectedUser.authId);
    expect(response.email).toEqual(expectedUser.email);
    expect(response.emailVerified).toEqual(expectedUser.emailVerified);
    expect(response.picture).toEqual(expectedUser.picture);
    expect(response.email).toEqual(expectedUser.email);
    expect(response.name).toEqual(expectedUser.name);
    expect(response.lastName).toEqual(expectedUser.lastName);
    expect(response.secondLastName).toEqual(expectedUser.secondLastName);
    expect(response.address).toEqual(expectedUser.address);
    expect(datesAreEqualWithinRange(response.createdAt!, expectedUser.createdAt!)).toBe(true);
    expect(datesAreEqualWithinRange(response.updatedAt!, expectedUser.updatedAt!)).toBe(true);
  })
  test("WithInexistenceUserId_GetUser_Null", async () =>{
    const userId = '61ad624c-7233-4839-8ece-49fe0e3041ca';

    const response = await _userService.getUser(userId)!;

    expect(response).toBeNull();
    
  })
  test("ExecuteGetUsers_GetUsers_GetUsersArray", async () =>{
    const numOfExpectedUsers = 2;
    const expectedUsers :GetUserResponseDto [] = [{
      id : '61ad624c-7233-4839-8ece-49fe0e3041ce',
      authId : '61ad624c-7233-4839-8ece-49fe0e3041ce',
      email : "emailtests@gmail.com",
      emailVerified : true,
      picture : "pictureurl",
      name: 'John',
      lastName: 'Doe',
      secondLastName: 'Doe2',
      age : 50, 
      address : "Address example",
      createdAt : new Date(),
      updatedAt : new Date()
    },
    {
      id : '61ad624c-7233-4839-8ece-49fe0e3041be',
      authId : '61ad624c-7233-4839-8ece-49fe0e3041le',
      email : "email2tests@gmail.com",
      emailVerified : true,
      picture : "pictureurl",
      name: 'Jue',
      lastName: 'Roe',
      secondLastName: 'Poe',
      age : 22, 
      address : "Address example",
      createdAt : new Date(),
      updatedAt : new Date()
    }
  ]

    const respose = await _userService.getUsers()!;
    if(!respose)
      throw new Error("Null response");
    const users = respose;
    expect(respose).toHaveLength(numOfExpectedUsers);
    respose.forEach((userRetrieved, i) =>{
      expect(userRetrieved.id).toEqual(expectedUsers[i].id);
      expect(userRetrieved.authId).toEqual(expectedUsers[i].authId);
      expect(userRetrieved.email).toEqual(expectedUsers[i].email);
      expect(userRetrieved.emailVerified).toEqual(expectedUsers[i].emailVerified);
      expect(userRetrieved.picture).toEqual(expectedUsers[i].picture);
      expect(userRetrieved.name).toEqual(expectedUsers[i].name);
      expect(userRetrieved.lastName).toEqual(expectedUsers[i].lastName);
      expect(userRetrieved.secondLastName).toEqual(expectedUsers[i].secondLastName);
      expect(userRetrieved.address).toEqual(expectedUsers[i].address);
      expect(datesAreEqualWithinRange(userRetrieved.createdAt!, expectedUsers[i].createdAt!)).toBe(true);
      expect(datesAreEqualWithinRange(userRetrieved.updatedAt!, expectedUsers[i].updatedAt!)).toBe(true);
    })

  })
  describe('Delete Users In db to get Empty', () => {
    beforeEach(async() =>{
      await UserFiles.destroy({where: {userId : '61ad624c-7233-4839-8ece-49fe0e3041ce'}})
      await User.destroy({where: {id : '61ad624c-7233-4839-8ece-49fe0e3041ce'}});
      await User.destroy({where: {id : '61ad624c-7233-4839-8ece-49fe0e3041be'}});
    });
    test("GetUsers_GetUsersFromEmptyDb_GetEmptyArray", async () =>{
      const numOfExpectedUsers = 0;
  
      const respose = await _userService.getUsers()!;
      if(!respose)
        throw new Error("Null response");
  
      expect(respose).toHaveLength(numOfExpectedUsers);
    })
  });

  test("WithExistenceUserId_GetUserFiles_ExistenceFile", async () =>{
    const userId = '61ad624c-7233-4839-8ece-49fe0e3041ce';
    const expectedUserFile : GetUserFilesDtoResponse = {
      userId : '61ad624c-7233-4839-8ece-49fe0e3041ce',
      files : [
        {
          id: "62ad624c-7233-4839-8ece-49fe0e3041ce",
          fileName: "fileName",
          fileSize: 10101, 
          fileType: "pdf",
          dropDate: "2023-07-06",
          visible: true,
          createdAt: new Date(),
          updatedAt: new Date(), 
        }
      ]
    }
    const response = await _userService.getUserFiles(userId)!;
    if(!response)
      throw new Error("Null response");
    const fileRetrieved = response.files[0];

    expect(response.userId).toEqual(expectedUserFile.userId);
    expect(response.files).toHaveLength(1);
    expect(fileRetrieved.id).toStrictEqual(expectedUserFile.files[0].id);
    expect(fileRetrieved.fileName).toStrictEqual(expectedUserFile.files[0].fileName);
    expect(fileRetrieved.fileSize).toStrictEqual(expectedUserFile.files[0].fileSize);
    expect(fileRetrieved.fileType).toStrictEqual(expectedUserFile.files[0].fileType);
    expect(fileRetrieved.visible).toStrictEqual(expectedUserFile.files[0].visible);
    expect(fileRetrieved.dropDate).toEqual(expectedUserFile.files[0].dropDate);
    expect(datesAreEqualWithinRange(fileRetrieved.createdAt, expectedUserFile.files[0].createdAt)).toBe(true);
    expect(datesAreEqualWithinRange(fileRetrieved.createdAt, expectedUserFile.files[0].createdAt)).toBe(true);
  })
  test("WithInexistenceUserId_GetUserFiles_Null", async () =>{
    const userId = '61ad624c-7233-4839-8ece-49fe0e3041da';
    
    const response = await _userService.getUserFiles(userId)!;

    expect(response).toBeNull();
  })
  test("WithInexistenceFilesForUser_GetUserFiles_ReturnsEmptyArray", async () =>{
    const userId = "61ad624c-7233-4839-8ece-49fe0e3041be";
    
    const response = await _userService.getUserFiles(userId)!;
    if(!response)
      throw new Error("Null response");

    expect(response.userId).toBe("61ad624c-7233-4839-8ece-49fe0e3041be");
    expect(response.files).toHaveLength(0);
  })
  // Test UploadUserFiles
  test("WithValidObject_UploadUserFile_FileAdded", async () =>{
    const userId = '61ad624c-7233-4839-8ece-49fe0e3041ce'
    const uploadFileObj : PostUserFileRequestDto = {
      fileId : '62ad624c-7233-4839-8ece-49fe0e3042ce',
      fileName : "fileName",
      fileSize : 10101,
      fileType : "pdf",
      dropDate : "2023-07-06",
      visible : true
    }
    const response = await _userService.uploadUserFile(userId, uploadFileObj);

    expect(response.userId).toEqual(userId);
    expect(response.fileId).toEqual(uploadFileObj.fileId);
    expect(response.fileName).toEqual(uploadFileObj.fileName);
    expect(response.fileSize).toEqual(uploadFileObj.fileSize);
    expect(response.fileType).toEqual(uploadFileObj.fileType);
    expect(response.dropDate).toEqual(uploadFileObj.dropDate);
    expect(response.visible).toEqual(uploadFileObj.visible);
    expect(datesAreEqualWithinRange(response.createdAt, new Date())).toBe(true);
    expect(datesAreEqualWithinRange(response.updatedAt, new Date())).toBe(true);
  });
  test("WithInexistenceFilesForUser_GetUserFiles_ReturnsEmptyArray", async () =>{
    const userId = "61ad624c-7233-4839-8ece-49fe0e3041be";
    
    const response = await _userService.getUserFiles(userId)!;
    if(!response)
      throw new Error("Null response");

    expect(response.userId).toBe("61ad624c-7233-4839-8ece-49fe0e3041be");
    expect(response.files).toHaveLength(0);
  })
  // Test UploadUserFiles
  test("WithInexistenceUser_UploadUserFile_Error", async () =>{
    const userId = '61ad624c-7233-4839-8ece-49fe0e3041rm';

    const uploadFileObj : PostUserFileRequestDto = {
      fileId : '62ad624c-7233-4839-8ece-49fe0e3042ce',
      fileName : "fileName",
      fileSize : 10101,
      fileType : "pdf",
      dropDate : "2023-07-06",
      visible : true
    }
    const addFileCallback = async () => await _userService.uploadUserFile(userId, uploadFileObj);

    await expect(addFileCallback).rejects.toThrow(ReferenceError)
  });
  test("WithExistenceFileIdAndUserId_UploadUserFile_Error", async () =>{
    const userId = '61ad624c-7233-4839-8ece-49fe0e3041ce';
    const uploadFileObj : PostUserFileRequestDto = {
      fileId : '62ad624c-7233-4839-8ece-49fe0e3041ce',
      fileName : "filename",
      fileSize : 10101,
      fileType : "pdf",
      dropDate : "2023-07-06",
      visible : true
    }
    const addFileCallback = async () => await _userService.uploadUserFile(userId, uploadFileObj);

    await expect(addFileCallback).rejects.toThrow(ReferenceError)
  });

  // Test Create userUser
  test("WithValidObject_CreateUser_UserCreated", async () =>{
    const userId = '61ad624c-7233-4839-8ece-49fe0e3041ce'
    const createUser : CreateUserRequestDto = {
      email : "myemail@maiela.com",
      emailVerified : true,
      authId : "auth|987654321",
      name : "harvey",
      lastName : "lean",
      picture : "http://localhost:4000/api/v1/users-api/#.png",
      secondLastName : "second",
      age : 33,
      address : "new avenue 23"
    }
    const response = await _userService.createUser(createUser);

    expect(response.id).toBeTruthy();
    expect(response.email).toEqual(createUser.email);
    expect(response.authId).toEqual(createUser.authId);
    expect(response.name).toEqual(createUser.name);
    expect(response.lastName).toEqual(createUser.lastName);
    expect(response.picture).toEqual(createUser.picture);
    expect(response.secondLastName).toEqual(createUser.secondLastName);
    expect(response.age).toEqual(createUser.age);
    expect(response.address).toEqual(createUser.address);
  });
  test("WithUserEmailInDb_CreateUser_ReferenceError", async () =>{
    const createUser : CreateUserRequestDto = {
      emailVerified : true,
      authId : "auth|987654321",
      email : "emailtests@gmail.com",
      name : "harvey",
      lastName : "lean",
      picture : "http://localhost:4000/api/v1/users-api/#.png",
      secondLastName : "second",
      age : 33,
      address : "new avenue 23"
    }

    const addUserCallback = async () => await _userService.createUser(createUser);

    await expect(addUserCallback).rejects.toThrow(ReferenceError)
  });
  test("WithAuthIdInDb_CreateUser_ReferenceError", async () =>{
    const createUser : CreateUserRequestDto = {
      email : "myemail@maiela.com",
      emailVerified : true,
      authId : '61ad624c-7233-4839-8ece-49fe0e3041ce',
      name : "harvey",
      lastName : "lean",
      picture : "http://localhost:4000/api/v1/users-api/#.png",
      secondLastName : "second",
      age : 33,
      address : "new avenue 23"
    }
    
    const addUserCallback = async () => await _userService.createUser(createUser);

    await expect(addUserCallback).rejects.toThrow(ReferenceError)
  });
  // Partial update tests
  test("WithValidObject_PartialUpdateUser_UserUpdated", async () =>{
    const userId = '61ad624c-7233-4839-8ece-49fe0e3041ce'
    const updateUserDto : PatchUserRequestDto = {
      emailVerified : true,
      name : "harvey",
      lastName : "lean",
      picture : "http://localhost:4000/api/v1/users-api/#.png",
      secondLastName : "second",
      age : 33,
      address : "new avenue 23"
    }

    const response = await _userService.partialUpdateUser(userId, updateUserDto);

    expect(response.id).toBeTruthy();
    expect(response.email).toBeTruthy();
    expect(response.authId).toBeTruthy();
    expect(response.name).toEqual(updateUserDto.name);
    expect(response.lastName).toEqual(updateUserDto.lastName);
    expect(response.picture).toEqual(updateUserDto.picture);
    expect(response.secondLastName).toEqual(updateUserDto.secondLastName);
    expect(response.age).toEqual(updateUserDto.age);
    expect(response.address).toEqual(updateUserDto.address);
  });
  test("WithOutUserInexistence_UpdatedUser_ReferenceError", async () =>{
    const userId = "61ad624c-7233-4839-8ece-49fe0e3041ca";
    const updateUserDto : PatchUserRequestDto = {
      emailVerified : true,
      name : "harvey",
      lastName : "lean",
      picture : "http://localhost:4000/api/v1/users-api/#.png",
      secondLastName : "second",
      age : 33,
      address : "new avenue 23"
    }

    const updateUserCallback = async () => await _userService.partialUpdateUser(userId, updateUserDto);

    await expect(updateUserCallback).rejects.toThrow(ReferenceError)
  });

  //Delete user file tests
  test("WithUserAndFile_DeleteUserFile_UserFileDeleted", async () =>{
    const userId = '61ad624c-7233-4839-8ece-49fe0e3041ce'
    const fileId = '62ad624c-7233-4839-8ece-49fe0e3041ce'

    const response = await _userService.deleteUserFile(userId, fileId);
    if(!response)
      throw new Error("Error at delete");
    const totalUserFiles = await _userService.getUserFiles(userId);
    if(!totalUserFiles)
      throw new Error("Null response");

    expect(totalUserFiles.files[0].visible).toBeFalsy();
  });
  test("WithInexistenceUser_DeleteUserFile_Error", async () =>{
    const userId = "61ad624c-7233-4839-8ece-49fe0e3041ca";
    const fileId = '62ad624c-7233-4839-8ece-49fe0e3041ce'

    const deleteUserCallback = async () => await _userService.deleteUserFile(userId, fileId);


    await expect(deleteUserCallback).rejects.toThrow(ReferenceError)
  });
  test("WithInexistenceFile_DeleteUserFile_Error", async () =>{
    const userId = "61ad624c-7233-4839-8ece-49fe0e3041ce";
    const fileId = '62ad624c-7233-4839-8ece-49fe0e3041cb'

    const deleteUserCallback = async () => await _userService.deleteUserFile(userId, fileId);


    await expect(deleteUserCallback).rejects.toThrow(ReferenceError)
  });

});
