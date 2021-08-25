'use strict';

require('dotenv').config();
const express = require('express');

const cors = require('cors');
const jwt = require('jsonwebtoken');
const jwksClient = require('jwks-rsa');
const mongoose = require('mongoose');

mongoose.connect('mongodb://127.0.0.1:27017/books', {useNewUrlParser: true, useUnifiedTopology: true});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  console.log('Mongoose is connected')
});

const Book = require('./models/Book');
const BookModel = require('./models/Book');
const app = express();
app.use(express.json());
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

//  ---- /books endpoints ----- //
app.get('/books', async (request, response) => {
  try {
    let booksdb = await Book.find({});
    response.status(200).send(booksdb);
  }
  catch (err) {
    response.status(500).send('database error');
  }
});
app.post('/books', (request, response) => {
  try{
    let { title, description, status, email } = request.body;
    const testBook4 = new Book({
      title: title,
      description: description,
      status: status,
      email: email,
    });
    testBook4.save();
    response.status(200).send(testBook4);
  }catch (err){
    response.status(500).send('Server error with creating a book.');
  }
});

app.put('/books/:id', async (request, response) => {
  try{
    let id = request.params.id;
    let {title, description, status} = request.body;
    let updatedBook = await BookModel.findByIdAndUpdate(id, {title, description, status}, {new:true, overwrite:true});
    response.status(200).send(updatedBook);
  }catch(err){
    response.status(500).send("Error updating the books information");
  }
})
app.delete('/books/:id', async (request, response) => {
  try{
    let id = request.params.id;
    await BookModel.findByIdAndDelete(id, );
    response.status(200).send(`Book has been deleted`);
  }catch(err){
    response.status(500).send('Error deleting book in server');
  }
});


// ---- testing endpoints ----- //
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
});
app.get('/clear', async (req, res) => {
  try {
    await Book.deleteMany({});
    res.status(200).send('DB Cleared');

  }
  catch (err) {
    res.status(500).send('Error when clearing the DB');
  }
} );

app.get('/seed', async (req,res) => {
  let books = await Book.find({});
  if (books.length === 0) {
    const testBook1 = new Book({
      title: "Guns Germs & Steel",
      description: "The fates of human societies through agriculture, warfare, and environment",
      status: "read",
      email: 'youngqp3@gmail.com',
    });
    const testBook2 = new Book({
      title: "Dune",
      description: "Dune is set in the distant future amidst a feudal interstellar society in which various noble houses control planetary fiefs",
      status: "not read",
      email: 'youngqp3@gmail.com',
    });
    const testBook3 = new Book({
      title: "Harry Potter and the Sorcerer's Stone",
      description: "Harry's first year at Hogwarts",
      status: "read",
      email: 'youngqp3@gmail.com',
    });
    
    testBook1.save();
    testBook2.save();
    testBook3.save();
  }
  res.send('Seeded The Database');
})
app.listen(PORT, () => console.log(`listening on ${PORT}`));
