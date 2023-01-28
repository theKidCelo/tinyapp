const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const cookieParser = require('cookie-parser')

function generateRandomString() {}

app.set("view engine", "ejs");

app.use(express.urlencoded({ extended: true }));
app.use(cookieParser())

function generateRandomString() {
    const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    const length = 6;
    let randomString = "";
    let randomNumber;
  
    for (let i = 0; i < length; i++) {
      randomNumber = Math.floor(Math.random() * characters.length);
      randomString += characters[randomNumber];
    }
    return randomString
  };

  function exisitingEmailLookup(email) {
    //loop through database
    for (const user in users) {
      if (email === users[user].email) {
        return users[user];
      }
    }
    return null;
  };


const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

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
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
    res.json(urlDatabase);
  });

app.get("/hello", (req, res) => {
    res.send("<html><body>Hello <b>World</b></body></html>\n");
  });

app.get("/urls", (req, res) => {
    const templateVars = {
        urls: urlDatabase,
        user: req.cookies['user_id']
      };

    res.render("urls_index", templateVars);
  });

app.get("/u/:id", (req, res) => {
    // const longURL = ...
    const templateVars = {
        id: req.params.id,
        longURL: urlDatabase[req.params.id],
        user: req.cookies['username']
      };
    res.redirect(longURL, templateVars);
  });

app.get("/urls/new", (req, res) => {
    const templateVars = {
        user: req.cookies['user_id']
      }

    res.render("urls_new", templateVars);
    
  });

app.get("/urls/:id", (req, res) => {
  const templateVars = {
    id: req.params.id,
    longURL: urlDatabase[req.params.id],
    user: users[req.cookies['user_id']]
  };

    res.render("urls_show", templateVars);

  });

  app.post("/urls", (req, res) => {
    console.log(req.body); // Log the POST request body to the console
    res.send("Ok"); // Respond with 'Ok' (we will replace this)
  });

  app.post("/urls/:id/delete", (req, res) => {
    delete urlDatabase[req.params.id]
    res.redirect("/urls");
  });

  app.post("/urls/:id/update", (req, res) => {

    console.log(req.body)
    urlDatabase[req.params.id] = req.body.Link;
    res.redirect("/urls");
  });

  app.get('/login', (req, res) => {
    let templateVars = {
      user: users[req.cookies['user_id']]
    };
    res.render('login', templateVars)
  });

  app.post("/login", (req, res) => {
    const userEmail = req.body.email
    const userPassword = req.body.password

    if (userEmail === '' || userPassword === '') {
      res.status(400);
      res.send('400 Bad request: Please enter a valid email and password');
    }

    for (let user in users) {

      if (userPassword === users[user].password && userEmail === users[user].email) {
        res.cookie("user_id", user)
        res.redirect('/urls');
      } else if (userEmail !== users[user].email) {
        res.status(403)
        res.send("Error 403 Forbidden: Email does not exist. Please try again.")
      } else if (userPassword !== users[user].password) {
        res.status(403)
        res.send("Error 403 Forbidden: Incorrect password. Please try again.")
      }
    }

  })

  app.post("/logout", (req, res) => {
    res.clearCookie("user_id")
    res.redirect('/urls')
  })

  app.get("/register", (req, res) => {
    const templateVars = {
        urls: urlDatabase,
        user: req.cookies['user_id']
      };
    res.render("register", templateVars)
  })

  app.post('/register', (req, res) => {

    if (req.body.email === '' || req.body.password === '') {
      res.status(400)
      res.send('404 Error: Please enter a valid email and password.');
    } else if (exisitingEmailLookup(req.body.email)) {
      res.status(400);
      res.send("400: Email associated with existing account.")
    } else {
      const userID = generateRandomString();
      users[userID] = {
        id: userID,
        email: req.body.email,
        password: req.body.password
      };

      res.cookie('user_id', userID);
      res.redirect('/urls');
    }
  
  });


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});