const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


public_users.post("/register", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  // 1. Check if username & password are provided
  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required" });
  }

  // 2. Check if user already exists
  const exists = users.find(user => user.username === username);

  if (exists) {
    return res.status(409).json({ message: "User already exists" });
  }

  // 3. Add new user
  users.push({ username, password });

  return res.status(200).json({ message: "User registered successfully" });
});

// Get the book list available in the shop
public_users.get('/',function (req, res) {
  return res.status(200).send(JSON.stringify(books, null, 4));
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn',function (req, res) {
  const isbn = req.params.isbn;
  return res.status(200).send(JSON.stringify(books[isbn], null, 4));
});
  
// Get book details based on author
public_users.get('/author/:author',function (req, res) {
  const author = req.params.author;
  let filteredBooks = {};

  Object.keys(books).forEach(key => {
    if (books[key].author === author) {
      filteredBooks[key] = books[key];
    }
  });

  return res.status(200).send(JSON.stringify(filteredBooks, null, 4));
});
// Get all books based on title
public_users.get('/title/:title', function (req, res) {
    const title = req.params.title;

    let filteredBooks = Object.values(books).filter(book => 
        book.title === title
    );

    if (filteredBooks.length > 0) {
        res.status(200).json(filteredBooks);
    } else {
        res.status(404).json({ message: "No book found with this title" });
    }
});

//  Get book review
public_users.get('/review/:isbn', function (req, res) {
  const isbn = req.params.isbn;

  const book = books[isbn];

  if (book) {
    return res.status(200).json(book.reviews);
  } else {
    return res.status(404).json({ message: "Book not found" });
  }
});

module.exports.general = public_users;
