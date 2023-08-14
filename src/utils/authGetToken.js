import axios from 'axios';
export const getNewToken = async () => {
  console.log("REQUEST TO GET NEW TOKEN EXECUTED");
  try {
    const requestData = {
      
        grant_type: 'client_credentials',
        client_id: process.env.AUTH0_CLIENT_ID,
        client_secret: process.env.AUTH0_CLIENT_SECRET,
        audience: process.env.AUTH0_AUDIENCE_USERS
      
    };
    const tokenRequest = {
      method: 'POST',
      url: `https://${process.env.AUTH0_DOMAIN}/oauth/token`,
      data: requestData
    };
    const response = await axios(tokenRequest);
    return response.data.access_token;
  } catch (error) {
    console.log(error.status)
    console.error('Error at get new token:', error.status);
    throw "Request error";
  }
};