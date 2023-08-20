import { injectable } from 'inversify';
import { UserServiceInterface } from '../../interfaces/UserServiceInterface';
import {User} from  "../../models/user";
import { UserFiles } from '../../models/user-file';
import { CreateUserRequestDto, GetUserFilesDtoResponse, GetUserResponseDto, PatchUserRequestDto, PostUserFileRequestDto, PostUserFileResponseDto} from "../../dtos/UserDtos";
import crypto, { UUID } from "crypto";
import { Sequelize, Op } from 'sequelize';
@injectable()
export class UserService implements UserServiceInterface {

  public async getUser(userId : string): Promise<GetUserResponseDto | null> {
    
    const user: User | null = await User.findByPk(userId);
    if (!user) {
        return null;
    }
    const{id, authId, email, emailVerified, picture, name, lastName, secondLastName, age, address,CreatedAt, UpdatedAt} = user.dataValues;
    const response: GetUserResponseDto = {id, authId, email, emailVerified, picture, name, lastName, secondLastName, age, address,
      createdAt: CreatedAt, updatedAt: UpdatedAt};
    return response;
  }
  public async getUsers(): Promise<GetUserResponseDto[]> {
    const users: User[] | null = await User.findAll({});
      if(users == null){
        return[];
      }
    const values = users
      const response: GetUserResponseDto[] = users.map(({dataValues}):
       GetUserResponseDto => {
        const {id, authId, email, emailVerified, picture, name, lastName,
          secondLastName, age, address,CreatedAt, UpdatedAt} = dataValues;
        return {
          id, authId, email, emailVerified, picture, name, lastName, secondLastName, age, address,
            createdAt: CreatedAt, updatedAt: UpdatedAt  
        }
       }
      ); 
      return response;   
  }
  public async getUserFiles(userId : string): Promise<GetUserFilesDtoResponse | null> {
    const user: User | null = await User.findByPk(userId);
    if(!user){
      return null;
    }
    const userFiles : UserFiles[] | undefined = await UserFiles.findAll({ 
      where : {
      userId : user.dataValues.id
    }});
    if(userFiles === undefined || userFiles === null){
      return ({
        userId: user.dataValues.id,
        files : []
      });}
    const files = userFiles.map( ({dataValues})=> {
      return{
        id : dataValues.fileId,
        fileName : dataValues.fileName,
        fileSize : dataValues.fileSize,
        fileType : dataValues.fileType,
        dropDate : dataValues.dropDate,
        visible : dataValues.visible,
        createdAt : dataValues.createdAt,
        updatedAt : dataValues.updatedAt
      }

    })
    const response: GetUserFilesDtoResponse = {
      userId: user.dataValues.id,
      files : files
    }
    return response;
  }
  public async uploadUserFile(userId : UUID, postDto : PostUserFileRequestDto): Promise<PostUserFileResponseDto> {
    const user: User | null = await User.findByPk(userId);
    if (!user) {
        throw new ReferenceError("User not found");
    }
    const fileExist = await UserFiles.findAndCountAll({
      where : {
        userId : userId,
        fileId : postDto.fileId
      }
    })
    if(fileExist.count>0){
      throw new ReferenceError(`File with id ${postDto.fileId} already exists`)
    }
    //Only retrieves fileIds
    const userFile : UserFiles = await UserFiles.create({
      userId : userId ,
      fileId : postDto.fileId, 
      fileName : postDto.fileName,
      fileSize : postDto.fileSize,
      fileType : postDto.fileType,
      dropDate : postDto.dropDate,
      visible : postDto.visible || true
    })
    return userFile.dataValues;
  }
  public async deleteUserFile(userId : string, fileId : string): Promise<boolean> {
    const user: User | null = await User.findByPk(userId);
    if (!user) {
        throw new ReferenceError("User not found");
    }
    const userFile = await UserFiles.findOne({
      where : {
        userId : userId,
        fileId : fileId
      }
    })
    if(!userFile){
      throw new ReferenceError(`Does not exist file with id ${fileId} in user Files`)
    }
    await userFile.update({visible : false});
    return true
  }
  public async createUser(requestDto: CreateUserRequestDto): Promise<GetUserResponseDto> {
    
    const user: User | null = await User.findOne({
      where: {
        [Op.or]: [
          { email: requestDto.email },
          { authId: requestDto.authId }
        ]
      }
    });
    if (user) {
      throw new ReferenceError(`User with common properties already registered`);
    }
    const userCreated = await User.create({
      id : crypto.randomUUID(),
      authId : requestDto.authId,
      email : requestDto.email,
      emailVerified : requestDto.emailVerified,
      picture : requestDto.picture,
      name : requestDto.name,
      lastName : requestDto.lastName,
      secondLastName : requestDto.secondLastName,
      age : requestDto.age,
      address : requestDto.address
    });
    return userCreated.dataValues;
  }
  public async partialUpdateUser(userId:UUID, updateUserDto: PatchUserRequestDto):Promise<GetUserResponseDto> {
    const user = await User.findByPk(userId);
      if (!user) {
        throw new ReferenceError("User not found");
      }
      const updateUserDtoObj = updateUserDto as any;
  
      const updatedFields:any = {};
      for (const key in updateUserDtoObj) {
        if (updateUserDtoObj[key] !== null) {
          updatedFields[key] = updateUserDtoObj[key];
        }
      }
      await user.update(updatedFields);
      const{id, authId, email, emailVerified, picture, name, lastName, secondLastName, age, address,CreatedAt, UpdatedAt} = user.dataValues;
      const response: GetUserResponseDto = {id, authId, email, emailVerified, picture, name, lastName, secondLastName, age, address,
        createdAt: CreatedAt, updatedAt: UpdatedAt};
      return response;
  }
  
  
}