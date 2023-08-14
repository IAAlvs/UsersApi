import { Container} from "inversify";
import { ServicesAspects } from "./ServicesAspects";
import { MiddlewareAspects } from "./MiddlewareAspects";



const iocContainer = new Container();
  MiddlewareAspects.Define(iocContainer);
  ServicesAspects.Define(iocContainer);

export {iocContainer};

