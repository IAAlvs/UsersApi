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
    Response,
    Security,
    Body,
    Post,
    Patch,
    Delete,
    Tags} from "tsoa";
export interface UserFilesControllerInterface{
    getUserFiles(userId: UUID): Promise<GetUserFilesDtoResponse | ErrorResponse>,
    uploadUserFile(userId: UUID,request : PostUserFileRequestDto): Promise<PostUserFileResponseDto | ErrorResponse>,
    deleteUserFile(userId : UUID, fileId: UUID): Promise<void| ErrorResponse>,
    partialUpdateUserFile(userId : UUID,fileId : UUID, request: PatchUserFileRequestDto): Promise<FileDto | ErrorResponse>
}

/** 
 *@isString Provide valid string
 *@pattern ^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$ Field does not match UUID pattern
*/
export type UUID = string;
/** 
  *@isString parameter this is string
  *@minLength 1 Can not be empty
  *@maxLength 20 Max num of characters is 20
  */
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
     *@isInt parameter fileSize is string
    *@minimum 1 fileSize can be less than 1
    *@maximum 2147483648 max value is 2147483648
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
export interface PatchUserFileRequestDto{
  /** 
  *@isString parameter fileName  must be string
  *@minLength 1 Can not be empty
  *@maxLength 200 Max num of characters is 10
  */
  fileName? : string|null,
  /** 
  *@isInt parameter fileSize is string
  *@minimum 1 fileSize can be less than 1
  *@maximum 2147483648 max value is 2147483648
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





@Tags("User files ")
@Route("api/v1/")
@provideSingleton(UserFilesController)
@injectable()
export class UserFilesController extends Controller implements UserFilesControllerInterface {
  //private readonly UserServiceInterface _user
    constructor(
    @inject(TYPES.UserServiceInterface) private _userService: UserServiceInterface
    ) {
    super();
    }

    /**
     * Retrieves all the files of a user
     * Supply the unique user ID from either and receive corresponding user files
     */
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
        console.error(error);
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
        console.error(error);
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
        console.error(error);
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
