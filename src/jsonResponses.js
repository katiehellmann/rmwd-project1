const fs = require('fs');
const http = require('http');

// load book data
const bookData = require('../data/books.json');

// a function that sends JSON responses
const respondJSON = (req, res, status, object) => {
  const content = JSON.stringify(object);

  // Debug log to check the type of `res`
  console.log(res instanceof http.ServerResponse); // This should log true if res is correct

  // res headers
  const headers = {
    'Content-Type': 'application/json',
  };

  // Write the header
  res.writeHead(status, headers);

  // Only write content if it's not a HEAD request
  if (req.method !== 'HEAD') {
    res.write(content);
  }

  // End the response
  res.end();

};

// function to get bookData and return the correct responses
const getBook = (req, res) => {
  const responseJSON = bookData;
  return respondJSON(req, res, 200, responseJSON);
};

// a function to get books by author
const getAuthor = (req, res, parsedUrl) => {
  const author = parsedUrl.searchParams.get('author');
  const result = bookData.find(
    (b) => b.author.toLowerCase() === author.toLowerCase(),
  );
  // if we find something, return it - otherwise send an error
  if (result) {
    return respondJSON(req, res, 200, result);
  }
  return respondJSON(req, res, 404, {
    message: 'No Books by that author found.',
    id: 'notFound',
  });
};

// a function to get books byt country
const getCountry = (req, res, parsedUrl) => {
  console.log(parsedUrl); // Debugging: See what this actually contains
  console.log(parsedUrl.searchParams); // Check if searchParams exists

  const country = parsedUrl.searchParams.get("country");
  const results = bookData.filter((b) => b.country.includes(country));
  // if we find something, return it - otherwise send an error
  if (results.length > 0) {
    return respondJSON(req, res, 200, results);
  }
  return respondJSON(req, res, 404, {
    message: 'No Books found from that country.',
    id: 'notFound',
  });
};

// a function to get books byt genre
const getGenre = (req, res, parsedUrl) => {
  const genres = parsedUrl.searchParams.get('genre');
  const results = bookData.filter((b) => b.genres && b.genres.includes(genres));
  // if we find something, return it - otherwise send an error
  if (results.length > 0) {
    return respondJSON(req, res, 200, results);
  }
  return respondJSON(req, res, 404, {
    message: 'No Books found from that genre.',
    id: 'notFound',
  });
};

// a function to get books by title
const getTitle = (req, res, parsedUrl) => {
  // Log the res object type before starting the function
  console.log(res instanceof http.ServerResponse); // Should log true initially

  const title = parsedUrl.searchParams.get('title');

  // Log to verify the title extracted from the query
  console.log('Title from query:', title);

  const results = bookData.filter((b) => b.title.includes(title));

  // Log to see the results of the filter
  console.log('Filtered results:', results);

  // if we find something, return it - otherwise send an error
  if (results.length > 0) {
    // Log before sending response
    console.log('Sending response with results');
    return respondJSON(req, res, 200, results);
  }

  // Log before sending error response
  console.log('No books found, sending error response');
  return respondJSON(req, res, 404, {
    message: 'No Books found with that title.',
    id: 'notFound',
  });
};

// a function to get books by have read
const getRead = (req, res) => {
  // get the data from the the read json
  fs.readFile('./data/readBooks.json', (err, data) => {
    const results = err ? [] : JSON.parse(data);

    // if we find something, return it - otherwise send an error
    if (results.length > 0) {
      return respondJSON(req, res, 200, results);
    }
    return respondJSON(req, res, 404, {
      message: 'No read Books found.',
      id: 'notFound',
    });
  });
};

// function to add a new book based on form input
const addBook = (req, res) => {
  const newBook = req.body;

  // are all fields provided
  if (!newBook.title || !newBook.author) {
    return respondJSON(req, res, 400, {
      message: 'Missing required Book data',
      id: 'badRequest',
    });
  }

  // check if one already exists
  newBook.title = newBook.title || bookData.length + 1;

  // add
  bookData.push(newBook);

  // write to file
  return fs.writeFile(
    './data/books.json',
    JSON.stringify(bookData, null, 2),
    (err) => {
      if (err) {
        return respondJSON(req, res, 500, {
          message: 'Error saving book data',
          id: 'serverError',
        });
      }
      return respondJSON(req, res, 201, {
        message: 'book added successfully',
        book: newBook,
      });
    },
  );
};

// a function to save books to a 'have read' list
const readBook = (req, res) => {
  const {
    title, author, genre, language, pages,
  } = req.body;

  if (!title || !author || !genre || !language || !pages) {
    return respondJSON(req, res, 400, {
      message: 'Missing required book data',
      id: 'badRequest',
    });
  }

  // console.log(title);
  // get the data from the the read json
  return fs.readFile('./data/readBooks.json', (err, data) => {
    const readBooks = err ? [] : JSON.parse(data);

    // none can be the same
    if (!readBooks.some((read) => read.title === title)) {
      readBooks.push({
        title, author, genre, language, pages,
      });

      return fs.writeFile(
        './data/readBooks.json',
        JSON.stringify(readBooks, null, 2),
        (writeErr) => {
          if (writeErr) {
            return respondJSON(req, res, 500, {
              message: 'Error saving read book',
              id: 'serverError',
            });
          }

          return respondJSON(req, res, 201, {
            message: 'Book marked as read successfully',
          });
        },
      );
    }
    return respondJSON(req, res, 400, {
      message: 'Book already marked as read',
      id: 'duplicate',
    });
  });
};

// function to handle a page that doesn't exist and return the appropriate message
const notFound = (req, res) => {
  const responseJSON = {
    message: "The page you are looking for doesn't exist.",
    id: 'notFound',
  };

  respondJSON(req, res, 404, responseJSON);
};

// export functions
module.exports = {
  getBook,
  readBook,
  getAuthor,
  getCountry,
  getGenre,
  getTitle,
  getRead,
  addBook,
  notFound,
};
