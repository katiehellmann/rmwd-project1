const http = require('http');
const query = require('querystring');
const htmlHandler = require('./htmlResponses.js');
const jsonHandler = require('./jsonResponses.js');

// set the server port
const PORT = process.env.PORT || process.env.NODE_PORT || 3000;

// map URL paths to their respective handlers
const urlStruct = {
  '/': htmlHandler.getIndex,
  '/style.css': htmlHandler.getCSS,
  '/addUser': jsonHandler.addUser,
  '/getUsers': jsonHandler.getUsers,
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
    request.body = query.parse(bodyString);
    handler(request, response);
  });
};

// handle POST requests
const handlePost = (request, response, parsedUrl) => {
  if (parsedUrl.pathname === '/addUser') {
    parseBody(request, response, jsonHandler.addUser);
  }
};

// a function that handles incoming requests and serves the correct content
const onRequest = (request, response) => {
  // determine if the request is using HTTP or HTTPS
  const protocol = request.connection.encrypted ? 'https' : 'http';
  const parsedUrl = new URL(
    request.url,
    `${protocol}://${request.headers.host}`,
  );

  // handle POST requests separately
  if (request.method === 'POST') {
    return handlePost(request, response, parsedUrl);
  }

  // if the requested path exists, call its handler
  if (urlStruct[parsedUrl.pathname]) {
    return urlStruct[parsedUrl.pathname](request, response);
  }

  // otherwise, return a 404 response
  return urlStruct.notFound(request, response);
};

// create and start the server
http.createServer(onRequest).listen(PORT, () => {
  console.log(`Server running on:${PORT}`);
});
