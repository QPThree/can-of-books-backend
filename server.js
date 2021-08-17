'use strict';

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const jwksClient = require('jwks-rsa');

const app = express();
app.use(cors());
// ---from jsonwebtoken docs ----
var client = jwksClient({
  // comes from auth0 docs single page application -> settings -> advanced settings -> endpoint -> the jwks one
  jwksUri: 'https://dev-y7gnygk3.us.auth0.com/.well-known/jwks.json'
});


function getKey(header, callback) {
  client.getSigningKey(header.kid, function (err, key) {
    var signingKey = key.publicKey || key.rsaPublicKey;
    callback(null, signingKey);
  });
}
//---------
const PORT = process.env.PORT || 3001;

app.get('/test', (request, response) => {

  // TODO: 
  // STEP 1: get the jwt from the headers
  // STEP 2. use the jsonwebtoken library to verify that it is a valid jwt
  // jsonwebtoken dock - https://www.npmjs.com/package/jsonwebtoken
  // STEP 3: to prove that everything is working correctly, send the opened jwt back to the front-end

  const token = request.headers.authorization.split(' ')[1];
  jwt.verify(token, getKey, {}, function (err, user) {
    if (err) {
      response.status(500).send('invlaid token');
    }
    console.log('user: ', user);
    response.send(user);
  });
})

app.listen(PORT, () => console.log(`listening on ${PORT}`));
