const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bcrypt = require("bcryptjs");
const cookieSession = require("cookie-session");
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
  b2xVn2: {
    longURL: "http://www.lighthouselabs.ca",
    userID: "userRandomID",
  },

  "9sm5xK": {
    longURL: "http://www.google.com",
    userID: "userRandomID",
  },
};

let users = {
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
  const templateVars = {
    user: users[req.session.user_id],
  };

  res.redirect(longURL, templateVars);
})

app.get("/urls", (req, res) => {
  let user = req.session.user_id;
  console.log(users);

  const templateVars = {
    user: users[user],
    urls: urlsForUser(user, urlDatabase),
  };

  console.log(templateVars.user);

  res.render("urls_index", templateVars);
});

app.get("/u/:id", (req, res) => {
  let ID = req.params.id;

  console.log(urlDatabase.ID);
  if (urlDatabase.ID == undefined) {
    res.send("error_DNE");
  }
  const templateVars = {
    id: ID,
    longURL: urlsForUser[ID].longURL,
    user: users[req.session.user_id],
  };

  res.redirect(longURL, templateVars);
});

app.get("/urls/new", (req, res) => {
  console.log("new");
  const userID = req.session.user_id;
  const user = users[userID];
  const templateVars = {
    user: users[userID],
    urls: urlsForUser(user, urlDatabase),
    longURL: req.params.longURL
  };

  if (!templateVars.user) {
    return res.render("login", templateVars);
  }

  res.render("urls_new", templateVars);
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

  const templateVars = { user };

  urlDatabase[req.params.shortURL] = {
    longURL: req.body.longURL,
    userID,
  };

  return res.redirect("/");
});

app.post("/urls", (req, res) => {
  const userID = req.session.user_id;
  const user = users[userID];

  if (!user) {
    return res.redirect("/login");
  }

  const shortURL = generateRandomString();
  urlDatabase[shortURL] = {};
  urlDatabase[shortURL].longURL = req.body.longURL;
  urlDatabase[shortURL].userID = userID;

  return res.redirect(`/urls/${shortURL}`);
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
  console.log(req.body);
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
    res.send("error_");
  }

  if (user === undefined) {
    res.send("error_");
  } else if (bcrypt.compareSync(user.password, hashedPassword) && user) {
    req.session.user_id = user.id;
    return res.redirect("/urls");
  }

  return res.status(403);
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
    res.send("error_reg");
  } else if (exisitingEmailLookup(req.body.email, users)) {
    res.status(400);
    res.send("error_reg");
  } else {
    const password = req.body.password;
    const hashedPassword = bcrypt.hashSync(password, 10);
    const userID = generateRandomString();
    users[userID] = {
      id: userID,
      email: req.body.email,
      password: hashedPassword,
    };
    console.log(users[userID].email);
    req.session.user_id = userID;
    res.redirect("/urls");
  }
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
