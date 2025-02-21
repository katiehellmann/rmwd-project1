const users = {};

// a function that sends JSON responses
// includes that status code and the object to return
const jsonResponse = (req, res, status, object) => {
  const content = JSON.stringify(object);

  // res headers
  const headers = {
    'Content-Type': 'application/json',
  };
  res.writeHead(status, headers);

  // only write content if head
  if (req.method !== 'HEAD') {
    res.write(content);
  }

  res.end();
};

// a function that gets users and returns the correct responses
const getUsers = (req, res) => {
  const responseJSON = {
    users,
  };
  return jsonResponse(req, res, 200, responseJSON);
};

// a function that adds a user based on form input
const addUser = (req, res) => {
  // default
  const responseJSON = {
    message: 'Name and age are required.',
  };

  const { name, age } = req.body;
  // make sure there is inputs, otherwise continue
  if (!name || !age) {
    responseJSON.id = 'missingParams';
    return jsonResponse(req, res, 400, responseJSON);
  }

  let responseCode = 204;

  // if there are no users by the inputted name,
  // add them to the list and send the appropriate res code
  if (!users[name]) {
    responseCode = 201;
    users[name] = {
      name,
    };
  }

  // otherwise, if they do exist, update their age (assuming no one has the same name)
  users[name].age = age;

  // if we were successful, return the data
  if (responseCode === 201) {
    responseJSON.message = 'Created Successfully!';
    return jsonResponse(req, res, responseCode, responseJSON);
  }

  return jsonResponse(req, res, responseCode, {});
};

// a function that handles a page that doesnt exist and returns the appropriate message
const notFound = (req, res) => {
  const responseJSON = {
    message: "The page you are looking for doesn't exist.",
    id: 'notFound',
  };

  jsonResponse(req, res, 404, responseJSON);
};

// export
module.exports = {
  getUsers,
  addUser,
  notFound,
};
