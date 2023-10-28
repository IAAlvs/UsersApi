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
    export interface UserSubscriptionControllerInterface{
        createUserSubscription(userId : UUID,request : CreateUserSubscriptionRequestDto): Promise<PostUserSubscriptionResponseDto | ErrorResponse>
        getUserSubscription(userId: UUID): Promise<PostUserSubscriptionResponseDto[] | ErrorResponse>  
        patchUserSubscriptions(userId : string, customerId : string, patchDto : PatchUserSubscriptionRequestDto) : Promise<PostUserSubscriptionResponseDto | ErrorResponse>
    }

    /** 
    *@isString Provide valid string
    @pattern ^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$ Field does not match UUID pattern
    */
    export type UUID = string;
    export interface ErrorResponse {
    message: string;
    statusCode: number;
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
    renewDate? : string,
    /** 
    *@isString parameter description  must be string
    *@maxLength 200 Max num of characters is 200
    */
    description? : string,
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
    export interface PatchUserSubscriptionRequestDto{
    /** 
     *@isString parameter renewDate is string
    *@pattern ^(2[012][0-9][0-9])-(0[1-9]|1[0-2])-(0[1-9]|[1-2][0-9]|3[0-1])$ Field does not match date YYYY-MM-DD pattern
    */
    renewDate? : string,
    /** 
     *@isString parameter description  must be string
    *@maxLength 200 Max num of characters is 200
    */
    description? :string
    }
    @Tags("Users Subscriptions")
    @Route("api/v1/")
    @provideSingleton(UsersSubscriptionController)
    @injectable()
    export class UsersSubscriptionController extends Controller implements UserSubscriptionControllerInterface {
    //private readonly UserServiceInterface _user
    constructor(
        @inject(TYPES.UserServiceInterface) private _userService: UserServiceInterface
        ) {
        super();
        }
    @Security("auth0",["create:profiles"])
    @Post("users/{userId}/subscriptions")
    @Response(401, 'UnAuthorized')
    @Response(409, 'Conflict')
    @Response<ErrorResponse>(400, "Bad request")
    @Response(500, "Server Error")
    public async createUserSubscription(@Path() userId : UUID, @Body() request : CreateUserSubscriptionRequestDto): Promise<PostUserSubscriptionResponseDto | ErrorResponse>{
        try {
        const userSubscription = await this._userService.createUserSubscription({
            userId,
            ...request
        }); 
        this.setStatus(200);
        //We  have multiple dtos one for service an other for service
        return userSubscription;
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
    @Security("auth0",["read:users"])
    @Get("users/{userId}/subscriptions")
    @Response(401, 'UnAuthorized')
    @Response<ErrorResponse>(400, "Bad request")
    @Response<ErrorResponse>(404, "Not found")
    @Response(500, "Server Error")
    public async getUserSubscription(@Path() userId: UUID): Promise<PostUserSubscriptionResponseDto[] | ErrorResponse>{
        try {
        const subscriptions = await this._userService.getUserSubscriptions(userId);
        if (!subscriptions){
            const errorResponse: ErrorResponse = {
            message: "Not subscriptions were found",
            statusCode: 404
            };
            this.setStatus(404);
            return errorResponse;
        }   
        this.setStatus(200);
        return subscriptions;
        
        }
        catch (error) {
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
        console.error(error);
        this.setStatus(500);
        return errorResponse;
        }
    }
    @Patch("users/{userId}/subscriptions/{customerId}")
    @Security("auth0",["create:profiles"])
    @Response(401, 'UnAuthorized')
    @Response(409, 'Conflict')
    @Response<ErrorResponse>(400, "Bad request")
    @Response(500, "Server Error")
    public async patchUserSubscriptions(@Path() userId: string,@Path() customerId: string,@Body() patchDto: PatchUserSubscriptionRequestDto): Promise<PostUserSubscriptionResponseDto | ErrorResponse> {
        try {
        const subscription = await this._userService.patchUserSubscription(userId, customerId, patchDto)
        this.setStatus(200);
        return subscription
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
