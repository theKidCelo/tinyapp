const cookieSession = require("cookie-session");
const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bcrypt = require("bcryptjs");

const {
  findUserByEmail,
  generateRandomString,
  exisitingEmailLookup,
  urlsForUser,
} = require("./helper");

app.set("view engine", "ejs");

app.use(express.urlencoded({ extended: true }));

app.use(
  cookieSession({
    name: "session",
    keys: ["test"],
  })
);

const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "aJ48lW",
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "aJ48lW",
  },
};
console.log(urlDatabase)
const users = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur",
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk",
  },
};

app.get("/", (req, res) => {
  console.log(urlDatabase)
  res.redirect("/urls");
});

app.get("/urls", (req, res) => {
  const userID = req.session.user_id;
  const user = users[userID];
  const templateVars = { user: user, urls: urlsForUser(userID) };
  console.log(urlsForUser(userID))

 if (!user) {
    return res.redirect("/login");
  }

  return res.render("urls_index", templateVars);
  /*
  const userID = req.session.user_id;
  const user = users[userID];

 

  const templateVars = {
    user: users[user],
    urls: urlsForUser(user, urlDatabase),
  };

  res.render("urls_index", templateVars);
  */
});

app.get("/u/:id", (req, res) => {
  const userID = req.session.user_id;
  const user = users[userID];
  const templateVars = { user: user };

  // short link does not exist
  if (!urlDatabase[req.params.shortURL]) {
    return res.render("pages/urls_error_linkDNE", templateVars);
  }

  // The user can create a short link with http:// prefixed or not
  // The code below is to accomodate this and to avoid errors upon redirecting
  const regex = new RegExp("^http");
  const longURLRedirect = urlDatabase[req.params.shortURL].longURL;

  // Check if the longURL in the database starts with http://
  if (regex.test(longURLRedirect)) {
    return res.redirect(`${longURLRedirect}`);
  } else {
    return res.redirect(`http://${longURLRedirect}`);
  }
  /*
  let ID = req.params.id;

  if (urlDatabase.ID == undefined) {
    res.send("error_DNE");
  }
  const templateVars = {
    id: ID,
    longURL: urlsForUser[ID].longURL,
    user: users[req.session.user_id],
  };

  res.redirect(longURL, templateVars);
  */
});

app.get("/urls/new", (req, res) => {
  const userID = req.session.user_id;
  const user = users[userID];
  const templateVars = { user: user };

  if (!user) {
    return res.redirect("/login");
  }

  return res.render("urls_new", templateVars);
});

app.post("/urls", (req, res) => {
  const userID = req.session.user_id;
  const user = users[userID];

  if (!user) {
    return res.redirect("/login");
  }
  console.log(urlDatabase)
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = {};
  urlDatabase[shortURL].longURL = req.body.longURL;
  urlDatabase[shortURL].userID = userID;
  console.log(urlDatabase)

  return res.redirect(`/urls/${shortURL}`);
});

app.get("/urls/:id", (req, res) => {
  let ID = req.params.id;

  if (urlDatabase[ID] === undefined) {
    res.send("error_DNE");
  }
  if (users[req.session.user_id] === undefined) {
    res.send("error_login");
  }
  if (!users[req.session.user_id]) {
    res.send("error_login");
  }
  const templateVars = {
    id: req.params.id,
    longURL: req.params.longURL,
    user: users[req.session.user_id],
  };

  res.render("urls_show", templateVars);
});

app.post("/urls/:id", (req, res) => {
  const userID = req.session.user_id;
  const user = users[userID];
  const URLsBelongingToUser = urlsForUser(userID, urlDatabase);

  const templateVars = { user };

  if (!user || !URLsBelongingToUser) {
    return res.render("pages/urls_error_linkOwner", templateVars);
  } else {
    urlDatabase[req.params.shortURL].longURL = req.body.longURL;
    console.log(urlDatabase)

    return res.redirect("/");
  }
});



app.post("/urls/:id/delete", (req, res) => {
  let ID = req.params.id;

  if (urlDatabase[ID] === undefined) {
    res.send("error_DNE");
  }
  if (req.session.user_id === undefined) {
    res.send("error_login");
  }
  if (!users[req.session.user_id]) {
    res.send("error_login");
  } else {
    delete urlDatabase[req.params.id];
  }
  res.redirect("/urls");
});

app.post("/urls/:id/update", (req, res) => {
  urlDatabase[req.params.id].longURL = req.body.Link;
  res.redirect("/urls");
});

app.get("/login", (req, res) => {
  let templateVars = {
    user: users[req.session.user_id],
  };

  if (templateVars.user) {
    return res.redirect("/urls");
  }

  res.render("login", templateVars);
});

app.post("/login", (req, res) => {
  let user = findUserByEmail(req.body.email, users);
  const formPassword = req.body.password;
  const hashedPassword = bcrypt.hashSync(formPassword, 10);
  const userEmail = req.body.email;
  const userPassword = req.body.password;

  if (userEmail === "" || userPassword === "") {
    res.status(400);
    return res.send("please fill in the form");
  }

  if (user === undefined) {
    return res.send("user does not exist");
  } else if (bcrypt.compareSync(userPassword, user.password) && user) {
    req.session.user_id = user.id;
    return res.redirect("/urls");
  }

  res.status(403);
  return res.send("Password is incorrect, please try again.");
});

app.post("/logout", (req, res) => {
  delete req.session.user_id;
  return res.redirect("/urls");
});

app.get("/register", (req, res) => {
  const templateVars = {
    urls: urlDatabase,
    user: users[req.session.user_id],
  };

  if (templateVars.user) {
    return res.redirect("/urls");
  }

  res.render("register", templateVars);
});

app.post("/register", (req, res) => {
  if (req.body.email === "" || req.body.password === "") {
    res.status(400);
    res.send("The form is empty please fill out the infomation");
  } else if (exisitingEmailLookup(req.body.email, users)) {
    res.status(400);
    res.send("This email is already in our system!");
  } else {
    const password = req.body.password;
    const hashedPassword = bcrypt.hashSync(password, 10);
    const userID = generateRandomString();
    users[userID] = {
      id: userID,
      email: req.body.email,
      password: hashedPassword,
    };
    req.session.user_id = userID;
    res.redirect("/urls");
  }
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
