const jwt = require('jsonwebtoken');
const jwksClient = require('jwks-rsa');


// Configura el cliente JWKS con la URL de JWKS de Auth0
const client = jwksClient({
  jwksUri: `https://${process.env.AUTH0_DOMAIN}/.well-known/jwks.json`
});

// Función para obtener la clave pública del JWKS
function getPublicKey(header, callback) {
  client.getSigningKey(header.kid, (err, key) => {
    const publicKey = key.getPublicKey();
    callback(null, publicKey);
  });
}

// Verifica el token utilizando la clave pública y devuelve el token decodificado o el error
export const verifyToken = (token) => {
  return new Promise((resolve) => {
    jwt.verify(token, getPublicKey, (err, decoded) => {
      if (err) {
        resolve({ error: err });
      } else {
        resolve({ decodedToken: decoded });
      }
    });
  });
};

