import { NextFunction, Request, Response } from 'express';

export function removeNullValuesMiddleware(req: Request, res: Response, next: NextFunction) {
  if (req.body) {
    req.body = removeNullValues(req.body);
  }
  next();
}

function removeNullValues(obj: any): any {
  const result: any = {};
  for (const key in obj) {
    if (obj[key] !== null) {
      if (typeof obj[key] === 'object' && !Array.isArray(obj[key])) {
        result[key] = removeNullValues(obj[key]);
      } else {
        result[key] = obj[key];
      }
    }
  }
  return result;
}
