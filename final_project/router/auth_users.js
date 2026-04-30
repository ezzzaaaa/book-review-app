const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

// IMPORTANT FIX: shared users array
let users = [];
const isValid = (username) => {
  return users.some(user => user.username === username);
};

const authenticatedUser = (username, password) => {
  return users.some(
    user => user.username === username && user.password === password
  );
};

// REGISTERED USERS LOGIN
regd_users.post("/login", (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "Username and password required" });
  }

  if (!authenticatedUser(username, password)) {
    return res.status(401).json({ message: "Invalid login credentials" });
  }

  let accessToken = jwt.sign(
    { username },
    "fingerprint_customer",
    { expiresIn: "1h" }
  );

  return res.status(200).json({
    message: "Login successful",
    token: accessToken
  });
});

// ADD / MODIFY REVIEW (JWT BASED)
regd_users.put("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const review = req.query.review;

  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(403).json({ message: "User not logged in" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const user = jwt.verify(token, "fingerprint_customer");

    if (!books[isbn]) {
      return res.status(404).json({ message: "Book not found" });
    }

    if (!books[isbn].reviews) {
      books[isbn].reviews = {};
    }

    books[isbn].reviews[user.username] = review;

    return res.status(200).json({
      message: "Review added/updated successfully",
      reviews: books[isbn].reviews
    });

  } catch (err) {
    return res.status(403).json({ message: "Invalid token" });
  }
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;