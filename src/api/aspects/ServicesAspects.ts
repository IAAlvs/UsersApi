import { Container, decorate, injectable } from "inversify";
import { Controller } from "tsoa";
import { UUID, UserControllerInterface, UsersController, PostUserFileRequestDto } from "../controllers/userController";
import { buildProviderModule } from "inversify-binding-decorators";
import TYPES from "../interfaces/ServiceTypes";
import { UserServiceInterface } from "../interfaces/UserServiceInterface";
import { UserService } from "../services/UsersService/UserService";

export class ServicesAspects{
    public static Define(iocContainer: Container) : void{
        /* For tsoa authomatic controller needs this decorator to work
        when routes are automatically generated
        it needs to be singleton to use ./provideSingleton
        */
        decorate(injectable(), Controller);
        iocContainer.bind<UserServiceInterface>(TYPES.UserServiceInterface).to(UserService).inSingletonScope()
        iocContainer.bind<UserControllerInterface>(TYPES.UserControllerInterface).to(UsersController).inSingletonScope();
        iocContainer.load(buildProviderModule());

    }

}