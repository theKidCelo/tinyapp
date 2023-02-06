const findUserByEmail = function (email, database) {
  for (let property in database) {
    const user = database[property];
    if (user.email === email) {
      console.log(user.email);
      return user;
    }
  }
};

const generateRandomString = function () {
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const length = 6;
  let randomString = "";
  let randomNumber;

  for (let i = 0; i < length; i++) {
    randomNumber = Math.floor(Math.random() * characters.length);
    randomString += characters[randomNumber];
  }
  return randomString;
};

const exisitingEmailLookup = function (email, users) {
  for (const user in users) {
    if (email === users[user].email) {
      return users[user];
    }
  }
  return null;
};

function urlsForUser(id, urlDatabase) {
  let URLS = [];

  for (let url in urlDatabase) {
    if (urlDatabase[url].userID === id) {
      URLS.push([url, urlDatabase[url].longURL]);
    }
  }

  return URLS;
}

module.exports = {
  findUserByEmail,
  generateRandomString,
  exisitingEmailLookup,
  urlsForUser,
};
