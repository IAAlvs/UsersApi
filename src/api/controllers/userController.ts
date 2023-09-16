// src/users/usersController.ts
import { provideSingleton } from '../aspects/provideSingleton';
import {inject, injectable } from "inversify";
import { UserServiceInterface } from '../interfaces/UserServiceInterface';
import TYPES from '../interfaces/ServiceTypes';
import {
  Controller,
  Get,
  Path,
  Route,
  SuccessResponse,
  Response,
  Security,
  Body,
  Post,
  Header,
  Request,
  Patch,
  Delete} from "tsoa";
export interface UserControllerInterface{
    getUser(userId: UUID, validator?: any): Promise<GetUserResponseDto | ErrorResponse>,
    getUsers(): Promise<GetUserResponseDto[] | ErrorResponse>,
    getUserFiles(userId: UUID): Promise<GetUserFilesDtoResponse | ErrorResponse>,
    uploadUserFile(userId: UUID,request : PostUserFileRequestDto): Promise<PostUserFileResponseDto | ErrorResponse>,
    deleteUserFile(userId : UUID, fileId: UUID): Promise<void| ErrorResponse>,
    createUser(userDto : CreateUserRequestDto) : Promise<CreateUserResponseDto | ErrorResponse>,
    partialUpdateUser(userId : UUID, request : PatchUserRequestDto): Promise<GetUserResponseDto | ErrorResponse>

}

/** 
 *@isString Provide valid string
 @pattern ^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$ Field does not match UUID pattern
*/
export type UUID = string;
  /** 
  *@isString parameter this is string
  *@minLength 1 Can not be empty
  *@maxLength 20 Max num of characters is 20
  */
export type PATHPARAM = string;
export interface GetUserResponseDto{

    id: UUID,
    authId : string,
    email : string,
    name? : string,
    lastName? : string,
    secondLastName? : string,
    age? : number,
    address? : string
    createdAt : Date, 
    updatedAt : Date
}
export interface FileDto{
  id : UUID,
  fileName : string,
  fileSize : number,
  fileType : string
  dropDate : string
  visible : boolean
  createdAt : Date
  updatedAt : Date
}
export interface GetUserFilesDtoResponse{
  userId : UUID,
  files : Array<FileDto>
} 
export interface ErrorResponse {
message: string;
statusCode: number;
}
export interface UploadUserFile{
  userId : UUID,
  fileId : UUID
}
export interface PostUserFileRequestDto{
  fileId : UUID,
  /** 
  *@isString parameter fileName  must be string
  *@minLength 1 Can not be empty
  *@maxLength 200 Max num of characters is 10
  */
  fileName : string,
  /** 
  *@isInt parameter fileType is string
  *@minimum 1 fileSize can be less than 1
  *@maximum 99999999 max value is 9999999999
  */
  fileSize : number,
  /** 
  *@isString parameter fileType is string
  *@minLength 1 Can not be empty
  *@maxLength 10 Max num of characters is 10
  */
  fileType : string,
  /** 
  *@isString parameter dropdate is string
  *@pattern ^(2[012][0-9][0-9])-(0[1-9]|1[0-2])-(0[1-9]|[1-2][0-9]|3[0-1])$ Field does not match date YYYY-MM-DD pattern
  */
  dropDate : string,
  visible? : boolean
}
export interface PostUserFileResponseDto{
  userId : UUID, 
  fileId : UUID,
  fileSize : number,
  fileType : string,
  dropDate : string,
  visible : boolean,
  createdAt : Date,
  updatedAt : Date
}
export interface CreateUserRequestDto{
  /**
   *@isString parameter email is string
   *@maxLength 50 Max num of characters is 50
   *@pattern ^(.+)@(.+)$ please provide correct email pattern
   */
  email : string,//same google and github and auth0 used as AuthId
  /** 
   * @isBool Valid must be a bool
   * */  
  emailVerified : boolean,//same google and github and auth0 used as AuthId
  /** 
  *@isString parameter authId is string
  *@maxLength 200 Max num of characters is 200
  */
  authId : string, //same google and github and auth0 used as AuthId
    /** 
  *@isString parameter name is string
  *@maxLength 80 Max num of characters is 80
  */
  name? : string, /* As  last name */
      /** 
  *@isString parameter lastName is string
  *@maxLength 80 Max num of characters is 80
  */
  lastName? : string,
  /** 
  *@isString parameter picture is string
  *@maxLength 1000 Max num of characters is 1000
  */
  picture? : string, //same google and github
  /** 
  *@isString parameter secondLastName is string
  *@maxLength 80 Max num of characters is 80
  */
  secondLastName? : string, // optional in db
  /** 
  *@isInt parameter fileType is string
  *@minimum 15 age can not be less than 15
  *@maximum 110 max value is 110
  */
  age? : number, //optional
  /** 
  *@isString parameter address is string
  *@maxLength 100 Max num of characters is 100
  */
  address? : string, //optional in db 
}
export interface PatchUserRequestDto{
  /** 
   * @isBool email Valid must be a bool
   * */  
  emailVerified? : boolean | null,//same google and github and auth0 used as AuthId
  /** 
  *@isString parameter name is string
  *@maxLength 80 Max num of characters is 80
  */
  name? : string|null, /* As  last name */
    /** 
  *@isString parameter lastName is string
  *@maxLength 80 Max num of characters is 80
  */
  lastName? : string|null,
  /** 
  *@isString parameter picture is string
  *@maxLength 1000 Max num of characters is 1000
  */
  picture? : string|null, //same google and github
  /** 
  *@isString parameter secondLastName is string
  *@maxLength 80 Max num of characters is 80
  */
  secondLastName? : string|null, // optional in db
  /** 
  *@isInt parameter fileType is string
  *@minimum 15 age can not be less than 15
  *@maximum 110 max value is 110
  */
  age? : number|null, //optional
  /** 
  *@isString parameter address is string
  *@maxLength 100 Max num of characters is 100
  */
  address? : string|null//optional in db 
}
export interface PatchUserFileRequestDto{
  /** 
  *@isString parameter fileName  must be string
  *@minLength 1 Can not be empty
  *@maxLength 200 Max num of characters is 10
  */
  fileName? : string|null,
  /** 
  *@isInt parameter fileType is string
  *@minimum 1 fileSize can be less than 1
  *@maximum 99999999 max value is 9999999999
  */
  fileSize? : number|null,
  /** 
  *@isString parameter fileType is string
  *@minLength 1 Can not be empty
  *@maxLength 10 Max num of characters is 10
  */
  fileType? : string|null,
  /** 
  *@isString parameter dropdate is string
  *@pattern ^(2[012][0-9][0-9])-(0[1-9]|1[0-2])-(0[1-9]|[1-2][0-9]|3[0-1])$ Field does not match date YYYY-MM-DD pattern
  */
  dropDate? : string|null,
  visible? : boolean|null
}
export interface CreateUserResponseDto{
  id : UUID,
  email : string,
  status : string

}
@Route("api/v1/")
@provideSingleton(UsersController)
@injectable()
export class UsersController extends Controller implements UserControllerInterface {
  //private readonly UserServiceInterface _user
  constructor(
    @inject(TYPES.UserServiceInterface) private _userService: UserServiceInterface
    ) {
    super();
  }
  @Security("auth0",["read:users"])
  @Get("users/{userId}")
  @Response(401, 'UnAuthorized')
  @Response<ErrorResponse>(400, "Bad request")
  @Response<ErrorResponse>(404, "Not found")
  @Response(500, "Server Error")
  public async getUser(@Path() userId: UUID): Promise<GetUserResponseDto | ErrorResponse>{
    try {
      const user = await this._userService.getUser(userId);
      if (!user){
        const errorResponse: ErrorResponse = {
          message: 'User not found',
          statusCode: 404
        };
        this.setStatus(404);
        return errorResponse;
      }   
      this.setStatus(200);
      return user as GetUserResponseDto;
      
    }
    catch (error) {
      const errorResponse: ErrorResponse = {
        message: 'Internal server error',
        statusCode: 500
      };
      this.setStatus(500);
      return errorResponse;
    }
  }
  @Security("auth0", ["global:users"])
  @Get("users")
  @SuccessResponse("200", "Ok")
  @Response(401, 'UnAuthorized')
  @Response(500, "Server Error")
  public async getUsers(): Promise<GetUserResponseDto[] | ErrorResponse> {
    try {
      const users = await this._userService.getUsers();
      this.setStatus(200);
      return users as GetUserResponseDto[];
    } catch (error) {
      const errorResponse: ErrorResponse = {
        message: 'Internal server error',
        statusCode: 500
      };
      //res.status(500).json(errorResponse);
      this.setStatus(500);
      return errorResponse;
    }
  }
  @Security("auth0",["read:users"])
  @Get("users/{userId}/files")
  @Response(401, 'UnAuthorized')
  @Response<ErrorResponse>(400, "Bad request")
  @Response<ErrorResponse>(404, "Not found")
  @Response(500, "Server Error")
  public async getUserFiles(@Path() userId: UUID): Promise<GetUserFilesDtoResponse | ErrorResponse>{
    try {
      const userFiles = await this._userService.getUserFiles(userId);
      if (!userFiles){
        const errorResponse: ErrorResponse = {
          message: 'User not found',
          statusCode: 404
        };
        this.setStatus(404);
        return errorResponse;
      }   
      this.setStatus(200);
      return userFiles;
      
    }
    catch (error) {
      const errorResponse: ErrorResponse = {
        message: 'Internal server error',
        statusCode: 500
      };
      this.setStatus(500);
      return errorResponse;
    }
  }
  @Security("auth0",["upload:user-files"])
  @Post("users/{userId}/files")
  @Response(401, 'UnAuthorized')
  @Response(409, 'Conflict')
  @Response<ErrorResponse>(400, "Bad request")
  @Response(500, "Server Error")
  public async uploadUserFile(@Path() userId : UUID, @Body() request : PostUserFileRequestDto): Promise<PostUserFileResponseDto | ErrorResponse>{    
    try {
      const userFile = await this._userService.uploadUserFile(userId,request); 
      this.setStatus(200);
      //We  have multiple dtos one for service an other for service
      return userFile;
    }
    catch (error) {
      if(error instanceof ReferenceError)
      {
        const conflictResponse: ErrorResponse = {
          message: error.message || "Conflict",
          statusCode: 409
        };
        this.setStatus(409);
        return conflictResponse;
      }
      const errorResponse: ErrorResponse = {
        message: 'Internal server error',
        statusCode: 500
      };
      this.setStatus(500);
      return errorResponse;
    }
  }
  @Security("auth0",["upload:user-files"])
  @Delete("users/:userId/files/:fileId")
  @Response(401, 'UnAuthorized')
  @Response(409, 'Conflict')
  @Response<ErrorResponse>(400, "Bad request")
  @Response(500, "Server Error")
  public async deleteUserFile(@Path() userId :UUID,@Path()fileId: UUID): Promise<void | ErrorResponse> {
    try {
      await this._userService.deleteUserFile(userId, fileId)
      this.setStatus(200);
      //We  have multiple dtos one for service an other for service
      return;
    }
    catch (error) {
      if(error instanceof ReferenceError){
        const errorResponse: ErrorResponse = {
          message: error.message,
          statusCode: 404
        };
        this.setStatus(404);
        return errorResponse;

      }
      const errorResponse: ErrorResponse = {
        message: 'Internal server error',
        statusCode: 500
      };
      this.setStatus(500);
      return errorResponse;
    }
  }
  @Post("users")
  @Security("auth0",["create:profiles"])
  @Response(401, 'UnAuthorized')
  @Response(409, 'Conflict')
  @Response<ErrorResponse>(400, "Bad request")
  @Response(500, "Server Error")
  public async createUser(@Body() request: CreateUserRequestDto): Promise<CreateUserResponseDto | ErrorResponse> {
    try {
      const user = await this._userService.createUser(request)
      this.setStatus(200);
      //We  have multiple dtos one for service an other for service
      return {
        id : user.id,
        email : user.email,
        status : "success"
      }
    }
    catch (error) {
      if(error instanceof ReferenceError){
        const errorResponse: ErrorResponse = {
          message: error.message,
          statusCode: 409
        };
        this.setStatus(409);
        return errorResponse;
      }
      const errorResponse: ErrorResponse = {
        message: 'Internal server error',
        statusCode: 500
      };
      this.setStatus(500);
      return errorResponse;
    }
  }
  @Patch("users/{userId}")
  @Security("auth0",["create:profiles"])
  @Response(401, 'UnAuthorized')
  @Response(409, 'Conflict')
  @Response<ErrorResponse>(400, "Bad request")
  @Response(500, "Server Error")
  public async partialUpdateUser(@Path() userId : UUID,@Body() request: PatchUserRequestDto): Promise<GetUserResponseDto | ErrorResponse> {
    try {
      /* Checking if user exist for provider id */
      //const exists = await this._userService.getUser()
      const user = await this._userService.partialUpdateUser(userId, request)
      this.setStatus(200);
      return user as GetUserResponseDto;
    }
    catch(error) {
      if(error instanceof ReferenceError)
      {
        const conflictResponse: ErrorResponse = {
          message: error.message || "Conflict",
          statusCode: 404
        };
        this.setStatus(404);
        return conflictResponse;
      }
      console.log(error);
      const errorResponse: ErrorResponse = {
        message: 'Internal server error',
        statusCode: 500
      };
      this.setStatus(500);
      return errorResponse;
    }
  }
  @Patch("users/{userId}/files/{fileId}")
  @Security("auth0",["upload:user-files"])
  @Response(401, 'UnAuthorized')
  @Response(409, 'Conflict')
  @Response<ErrorResponse>(400, "Bad request")
  @Response(500, "Server Error")
  public async partialUpdateUserFile(@Path() userId : UUID, @Path() fileId : UUID,@Body() request: PatchUserFileRequestDto): Promise<FileDto | ErrorResponse> {
    try {
      const user = await this._userService.partialUpdateUserFile(userId, fileId, request)
      this.setStatus(200);
      return user as FileDto;
    }
    catch(error) {
      if(error instanceof ReferenceError)
      {
        const conflictResponse: ErrorResponse = {
          message: error.message || "Conflict",
          statusCode: 404
        };
        this.setStatus(404);
        return conflictResponse;
      }
      const errorResponse: ErrorResponse = {
        message: 'Internal server error',
        statusCode: 500
      };
      this.setStatus(500);
      return errorResponse;
    }
  }
}
