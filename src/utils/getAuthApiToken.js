import { getNewToken } from './authGetToken';
import {verifyToken} from './verifyToken';
import cookie from 'cookie';
import crypto from 'crypto';

const IV_LENGTH = 16; // Cypher vector size
const expirationInSeconds = 86400;
//key to encrypt
const SECRET_KEY = process.env.SECRET_KEY_COOKIES;

const encrypt = (text) => {
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(SECRET_KEY, 'hex'), iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return iv.toString('hex') + ':' + encrypted;
};
const decrypt = (text) => {
    const parts = text.split(':');
    const iv = Buffer.from(parts[0], 'hex');
    const encryptedText = parts.slice(1).join(':');
    const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(SECRET_KEY, 'hex'), iv);
    let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  };
export default  async function getAuthApiToken (req, res){
const cookies = cookie.parse(req.headers.cookie || '');
const accessToken = cookies.accessToken;
try {
  if (accessToken) {
      const decryptedToken = JSON.parse(decrypt(accessToken));
      //console.log(decryptedToken);
      let {error, decodedToken} = await verifyToken(decryptedToken.token);
      let tokenHasBeenChanged;
      if(error)
          tokenHasBeenChanged = true;
      const tokenHasExpired = decodedToken.exp < Math.floor(Date.now() / 1000);
      if (!tokenHasExpired && !tokenHasBeenChanged)
        return decryptedToken.token;
      
  } 
  const newToken = await getNewToken();
  let decodedToken = {
      token: newToken,
      exp: Math.floor(Date.now() / 1000) + expirationInSeconds
  };
  // Cypher again token
  const encryptedToken = encrypt(JSON.stringify(decodedToken));
  // SAVE COOKIE
  res.setHeader(
      'Set-Cookie',
      cookie.serialize('accessToken', encryptedToken, {
      httpOnly: true,
      secure: true,
      path: '/',
      maxAge: expirationInSeconds, // MAX AGE 1 DAY
      sameSite: 'strict',
      })
  );
  return decodedToken.token; 
} catch (error) {
  console.error('Error at read and reemplaze token:', error);
  res.status(422)(error);    
}
}
  
