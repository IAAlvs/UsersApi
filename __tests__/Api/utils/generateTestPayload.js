const configureEnvv = () =>{
    process.env.AUTH0_DOMAIN = 'fakedomain.com'
    process.env.AUTH0_AUDIENCE_USERS='https://myapi.api.com'
}
const getTestToken = (scopesArray) =>{ return {
      iss: `https://${process.env.AUTH0_DOMAIN}/`,
      sub: "12345678910test",
      aud: `${process.env.AUTH0_AUDIENCE_USERS}`,
      azp: "12345678910",
      gty: "client-credentials",
      scope: scopesArray
}};
    
module.exports =  {getTestToken, configureEnvv}