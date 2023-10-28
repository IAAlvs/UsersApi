import { injectable } from 'inversify';
import { UserServiceInterface } from '../../interfaces/UserServiceInterface';
import {User} from  "../../models/user";
import { UserFiles } from '../../models/user-file';
import { 
  CreateUserRequestDto,
  GetUserFilesDtoResponse,
  GetUserResponseDto, 
  PatchUserRequestDto,
  PatchUserFileRequestDto,
  PostUserFileRequestDto, 
  PostUserFileResponseDto,
  FileDto,
  CreateUserSubscription,
  PostUserSubscriptionResponseDto,
  PatchUserSubscriptionRequestDto} from "../../dtos/UserDtos";
import crypto, { UUID } from "crypto";
import { Op } from 'sequelize';
import { UserSubscriptions } from "../../models/users-subscription";

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
  public async partialUpdateUserFile(userId:string, fileId:string, updateUserFileDto: PatchUserFileRequestDto):Promise<FileDto> {
    const user = await User.findByPk(userId);
    if (!user) 
      throw new ReferenceError("User not found");
    const userFile = await UserFiles.findOne({
      where : {
        userId : userId,
        fileId : fileId
      }
    });
    if(!userFile)
        throw new ReferenceError("File not found");
    const updatedFields:any = {};
    for (const key in updateUserFileDto as Record<string, any>) {
      if ((updateUserFileDto as Record<string, any>)[key] !== null) {
        updatedFields[key] = (updateUserFileDto as Record<string, any>)[key];
      }
    }
    await userFile.update(updatedFields);
    const {dataValues} = userFile;
    
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
  }
  
  public async createUserSubscription(subscriptionDto : CreateUserSubscription): Promise<PostUserSubscriptionResponseDto> {
    const {userId, customerId, renewDate, description} = subscriptionDto;
    const user: User | null = await User.findByPk(userId);
    if (!user) {
        throw new ReferenceError("User not found");
    }
    const subscriptionExist = await UserSubscriptions.findAndCountAll({
      where : {
        userId : userId,
        customerId : customerId
      }
    })
    if(subscriptionExist.count>0){
      throw new ReferenceError(`Subscription with customer ${customerId} already exists`)
    }
    const userSubscription : UserFiles = await UserSubscriptions.create({
      id : crypto.randomUUID(),
      userId : userId ,
      customerId : customerId,
      renewDate : renewDate,
      description : description
    })
    return userSubscription.dataValues;
  }
  public async getUserSubscriptions(userId: string): Promise<PostUserSubscriptionResponseDto[]> {
    const user: User | null = await User.findByPk(userId);
    if (!user) {
        throw new ReferenceError("User not found");
    }
    const {count, rows} = await UserSubscriptions.findAndCountAll({
        where :{
          userId : userId
        }
      })
      if (count === 0) {
          return [];
      }
      let response : PostUserSubscriptionResponseDto[] = [];
      rows.map((subscription:UserSubscriptions) =>
      response.push(subscription as unknown as PostUserSubscriptionResponseDto))
      return response;
  }
  
  public async patchUserSubscription(userId: string, customerId: string, patchDto : PatchUserSubscriptionRequestDto): Promise<PostUserSubscriptionResponseDto> {
    const subscription = await UserSubscriptions.findOne({
      where : {
        userId, 
        customerId
      }
    });
    if (!subscription) {
      throw new ReferenceError("User subscription not found");
    }
    const patchUserDtoObj = patchDto as Record<string, any>;

    const updatedFields:Record<string, any> = {};
    for (const key in patchUserDtoObj) {
      if (patchUserDtoObj[key] !== null) {
        updatedFields[key] = patchUserDtoObj[key];
      }
    }
    await subscription.update(updatedFields);
    return subscription.dataValues;
  }
  public async updateBeatenSubscriptions(): Promise<void> {
    const today = new Date();
    const todayStr = today.toISOString().split("T")[0];
    await UserSubscriptions.update(
    {
      renewDate : null,
      description : "Free"
    },
    {
      where : {
        renewDate : {
          [Op.lt]: todayStr
        }
      }
    }); 
  }
  public async updateBeatenTemporalyFiles(): Promise<void> {
    const today = new Date();
    /* We add a day to avoid confusion with timezones */
    const todayStr = today.toISOString().split("T")[0];

    await UserFiles.update(
    {
      visible : false
    },
    {
      where : {
        dropDate : {
          [Op.lt]: todayStr
        }
      }
    }); 
  }
}