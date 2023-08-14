// Auth.ts
import express from 'express';
import { ServerResponse } from 'http';
import jwt, { JsonWebTokenError } from 'jsonwebtoken';
import jwksRsa from 'jwks-rsa';

export function expressAuthentication(
  request: express.Request,
  securityName: string,
  scopes?: string[]
): Promise<void> {
  if (securityName === 'auth0') {
    const token = request.headers['authorization'];
    return new Promise((resolve, reject) => {
      if (!token) {
        reject(new JsonWebTokenError("Not token found"));
      }
      const client = jwksRsa({
        cache: false,
        rateLimit: true,
        jwksRequestsPerMinute: 5,
        jwksUri: `https://${process.env.AUTH0_DOMAIN}/.well-known/jwks.json`
      });
      function getKey(header: any, callback: any) {
        client.getSigningKey(header.kid, function(err, key: any) {
          if(!key){
            callback(err, null);
          }
          else{
            const signingKey = key.publicKey || key.rsaPublicKey;
            callback(null, signingKey);
          }

        });
      }
      //Because i have pattern Bearer <token>
      const splitToken = token?.trim().split(" ")[1]!;
      jwt.verify(splitToken, getKey, function(err: any, decoded: any) {
        if (err) {
          reject(new JsonWebTokenError(err.message || "Sign err"));
        } else {
          let usersApiAudience = process.env.AUTH0_AUDIENCE_USERS;
          if (decoded.aud !== usersApiAudience  && !decoded.aud.includes(usersApiAudience)) {
            reject(new JsonWebTokenError('UnAuthorized 1'));
          }
          if (decoded.iss != `https://${process.env.AUTH0_DOMAIN}/`) {
            reject(new JsonWebTokenError("UnAuthorized 2"));
          }
          if(scopes && scopes!.length !== 0)
          {
            for (let scope of scopes!) {
              //console.log(decoded.scope.includes(scope))
              if (!decoded.scope || !decoded.scope.includes(scope)) {
                reject(new JsonWebTokenError("Unauthorized 3"));
              }
            }
          }
          resolve(decoded);
        }
      });
    });
  }
  return new Promise((resolve, reject) =>  
    reject(new JsonWebTokenError("Authorization not recognized")));
}