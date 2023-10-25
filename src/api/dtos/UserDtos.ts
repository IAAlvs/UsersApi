import { UUID } from "crypto"
export interface GetUserResponseDto{
    id: UUID,
    authId : string,
    email : string,
    emailVerified : boolean,
    picture : string ,
    name? : string,
    lastName? : string,
    secondLastName? : string,
    age? : number,
    address? : string,
    createdAt? : Date,
    updatedAt? : Date
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
export interface PostUserFileRequestDto{
    fileId : string,
    fileName : string,
    fileSize : number,
    fileType : string,
    dropDate : string,
    visible? : boolean
}
export interface PostUserFileResponseDto{
    userId : string, 
    fileId : string,
    fileName : string,
    fileSize : number,
    fileType : string,
    dropDate : string,
    visible : boolean,
    createdAt : Date,
    updatedAt : Date, 
}
export interface CreateUserRequestDto{
    authId : string,
    email : string,
    emailVerified : boolean,
    picture? : string,
    name? : string,
    lastName? : string,
    secondLastName? : string,
    age? : number,
    address? : string,
}
export interface PatchUserRequestDto{
    emailVerified? : boolean|null,
    picture? : string|null,
    name? : string|null,
    lastName? : string|null,
    secondLastName? : string|null,
    age? : number|null,
    address? : string|null
}
export interface PatchUserFileRequestDto{
    fileName? : string|null,
    fileSize? : number|null,
    fileType? : string|null,
    dropDate? : string|null,
    visible? : boolean|null
}
export interface CreateUserSubscription{
    userId : string,
    customerId : string, 
    renewDate? : string
    description? : string
}
export interface PostUserSubscriptionResponseDto{
    id : string,
    userId : string,
    customerId : string,
    renewDate : string,
    description? : string,
    createdAt : Date,
    updatedAt : Date
}
export interface PatchUserSubscriptionRequestDto{
    renewDate? : string,
    description? : string
}