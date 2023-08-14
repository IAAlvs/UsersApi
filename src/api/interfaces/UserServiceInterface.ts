import { CreateUserRequestDto, GetUserFilesDtoResponse, GetUserResponseDto, PatchUserRequestDto, PostUserFileRequestDto, PostUserFileResponseDto } from "@/api/dtos/UserDtos";
import { UUID } from "crypto";

export interface UserServiceInterface{
    getUsers() : Promise<GetUserResponseDto[]>,
    getUser(userId : string) : Promise<GetUserResponseDto | null>,
    getUserFiles(userId : string) : Promise<GetUserFilesDtoResponse | null>,
    deleteUserFile(userId : string, fileId : string) : Promise<boolean>,
    uploadUserFile(userId : string, requestDto: PostUserFileRequestDto) : Promise<PostUserFileResponseDto>,
    createUser(requestDto: CreateUserRequestDto) : Promise<GetUserResponseDto>,
    partialUpdateUser(userId : string, updateUserDto: PatchUserRequestDto):Promise<GetUserResponseDto>
}