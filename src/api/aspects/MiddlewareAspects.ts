import { Container, decorate, injectable } from "inversify";
import { Controller } from "tsoa";
//import { AuthMiddleware } from "../middlewares/Authorization/AuthorizationMiddleware";

export class MiddlewareAspects{
    public static Define(iocContainer: Container) : void{
        //iocContainer.bind<AuthMiddleware>(AuthMiddleware).toSelf().inSingletonScope();
    }

}