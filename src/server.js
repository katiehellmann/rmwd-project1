const http = require('http');
// const query = require('querystring');
const htmlHandler = require('./htmlResponses.js');
const jsonHandler = require('./jsonResponses.js');

// set the server port
const PORT = process.env.PORT || process.env.NODE_PORT || 3001;

// map URL paths to their respective handlers
const urlStruct = {
  '/': htmlHandler.getIndex,
  '/style.css': htmlHandler.getCSS,
  '/addBook': jsonHandler.addBook,
  '/readBook': jsonHandler.readBook,
  '/getBook': jsonHandler.getBook,
  '/getBookByCountry': jsonHandler.getCountry,
  '/getBookByGenre': jsonHandler.getGenre,
  '/getBookByAuthor': jsonHandler.getAuthor,
  '/getSearchBookByRead': jsonHandler.getRead,
  '/getBookByTitle': jsonHandler.getTitle,

  notFound: jsonHandler.notFound,
};

// body parse demo
// a function to parse the body of incoming requests
const parseBody = (request, response, handler) => {
  const body = [];

  // handle request errors
  request.on('error', (err) => {
    console.dir(err);
    response.statusCode = 400;
    response.end();
  });

  request.on('data', (chunk) => {
    body.push(chunk);
  });

  request.on('end', () => {
    const bodyString = Buffer.concat(body).toString();
    request.body = JSON.parse(bodyString);
    handler(request, response);
  });
};

// handle POST requests
const handlePost = (request, response, parsedUrl) => {
  if (parsedUrl.pathname === '/addBook') {
    parseBody(request, response, jsonHandler.addBook);
  }
  if (parsedUrl.pathname === '/readBook') {
    parseBody(request, response, jsonHandler.readBook);
  }
};

// a function that handles incoming requests and serves the correct content
const onRequest = (req, res) => {
  const protocol = req.connection.encrypted ? 'https' : 'http';
  const parsedUrl = new URL(req.url, `${protocol}://${req.headers.host}`);
  console.log(res instanceof http.ServerResponse); // Should log: true

  if (req.method === 'POST') {
    return handlePost(req, res, parsedUrl);
  }

  if (urlStruct[parsedUrl.pathname]) {
    return urlStruct[parsedUrl.pathname](req, res, parsedUrl);
  }

  return urlStruct.notFound(req, res);
};

// create and start the server
http.createServer(onRequest).listen(PORT, () => {
  console.log(`Server running on:${PORT}`);
});
