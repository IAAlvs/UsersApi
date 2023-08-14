import {Response, Request, NextFunction} from "express";
import { JsonWebTokenError } from "jsonwebtoken";
import { ValidateError} from "tsoa";


export default function errorHandler(
    err: unknown,
    req: Request,
    res: Response,
    next: NextFunction
  ): Response | void {  
    if (err instanceof ValidateError) {
      return res.status(422).json({
        message: "Validation Failed",
        details: err?.fields,
      });
    } 
    if (err instanceof JsonWebTokenError) {
      //console.warn(`Caught Validation Error for ${req.path}:`, err.fields);
      return res.status(401).json({
        message: "UnAuthorized",
        detail : err?.message
      });
    } 
    if(err instanceof SyntaxError){
      return res.status(422).json({
        message : "Entity parse json failed",
        status : 422
      })
    }
    if (err instanceof Error) {
      console.log(err)
      console.log(JSON.stringify(err))
      return res.status(500).json({
        message: "Internal Server Error",
      });
    }
  
    next();
  }