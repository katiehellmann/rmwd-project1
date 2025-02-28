const fs = require('fs');
const path = require('path');

// load book data
let bookData = require('../data/books.json');

// function to save data back to the JSON file
const saveBookData = () => {
  fs.writeFileSync(path.join(__dirname, '../data/books.json'), JSON.stringify(bookData, null, 2), 'utf-8');
};

// a function that sends JSON responses
const jsonResponse = (req, res, status, object) => {
  const content = JSON.stringify(object);

  // res headers
  const headers = {
    'Content-Type': 'application/json',
  };
  res.writeHead(status, headers);

  // only write content if it's not a HEAD request
  if (req.method !== 'HEAD') {
    res.write(content);
  }

  res.end();
};

// function to get bookData and return the correct responses
const getBook = (req, res) => {
  const responseJSON = {
    bookData,
  };
  return jsonResponse(req, res, 200, responseJSON);
};

// function to add a new book based on form input
const addBook = (req, res) => {
  // default response
  const responseJSON = {
    message: 'All forms required.',
  };

  const { name, age, genre, author, language, pages, read } = req.body;

  // check if all required fields are present
  if (!name || !age || !genre || !author || !language || !pages || !read) {
    responseJSON.id = 'missingParams';
    return jsonResponse(req, res, 400, responseJSON);
  }

  let responseCode = 204;

  // if there is no book data with the inputted name, add it to the list
  if (!bookData.some(book => book.name === name)) {
    responseCode = 201;
    const newBook = { name, age, genre, author, language, pages, read };
    bookData.push(newBook);

    // save the updated book data to the file
    saveBookData();

    console.log("Added book:", newBook);
  } else {
    responseJSON.message = 'Book with that name already exists.';
    return jsonResponse(req, res, 409, responseJSON);
  }

  // if successful, return the data
  if (responseCode === 201) {
    responseJSON.message = 'Created Successfully!';
    return jsonResponse(req, res, responseCode, responseJSON);
  }

  return jsonResponse(req, res, responseCode, {});
};

// function to handle a page that doesn't exist and return the appropriate message
const notFound = (req, res) => {
  const responseJSON = {
    message: "The page you are looking for doesn't exist.",
    id: 'notFound',
  };

  jsonResponse(req, res, 404, responseJSON);
};

// Export functions
module.exports = {
  getBook,
  addBook,
  notFound,
};
