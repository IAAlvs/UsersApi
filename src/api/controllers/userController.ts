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
  Patch,
  Tags} from "tsoa";
export interface UserControllerInterface{
    createUser(userDto : CreateUserRequestDto) : Promise<CreateUserResponseDto | ErrorResponse>,
    getUser(userId: UUID, validator?: any): Promise<GetUserResponseDto | ErrorResponse>,
    getUsers(): Promise<GetUserResponseDto[] | ErrorResponse>,
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
export interface ErrorResponse {
message: string;
statusCode: number;
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
export interface CreateUserResponseDto{
  id : UUID,
  email : string,
  status : string

}
export interface CreateUserSubscriptionRequestDto{
  /** 
  *@isString parameter customerId  must be string
  *@minLength 1 customerId Can not be empty
  *@maxLength 50 Max num of characters is 50
  */
  customerId : string,
    /** 
  *@isString parameter renewDate is string
  *@pattern ^(2[012][0-9][0-9])-(0[1-9]|1[0-2])-(0[1-9]|[1-2][0-9]|3[0-1])$ Field does not match date YYYY-MM-DD pattern
  */ 
  renewDate : string
}
export interface PostUserSubscriptionResponseDto{
  id : string,
  userId : string,
  /** 
  *@isString parameter customerId  must be string
  *@minLength 1 customerId Can not be empty
  *@maxLength 50 Max num of characters is 50
  */
  customerId : string,
  /** 
  *@isString parameter renewDate is string
  *@pattern ^(2[012][0-9][0-9])-(0[1-9]|1[0-2])-(0[1-9]|[1-2][0-9]|3[0-1])$ Field does not match date YYYY-MM-DD pattern
  */ 
  renewDate : string,
  updatedAt : Date,
  createdAt : Date
}
@Tags("Users profile")
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
  /**
   * Retrieves the details of an existing user.
   * Supply the unique user ID from either and receive corresponding user details.
   */
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
      console.error(error);
      this.setStatus(500);
      return errorResponse;
    }
  }
  /**
   * Retrieves All users
   *
   */
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
      console.error(error);
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
      console.error(error);
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
      console.error(error);
      const errorResponse: ErrorResponse = {
        message: 'Internal server error',
        statusCode: 500
      };
      this.setStatus(500);
      return errorResponse;
    }
  }
}
