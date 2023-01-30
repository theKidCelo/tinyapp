const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const cookieParser = require('cookie-parser')
const bcrypt = require("bcryptjs");

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
  "b2xVn2": {
    longURL: "http://www.lighthouselabs.ca",
    userID: "userRandomID",
  },

  "9sm5xK": {
    longURL: "http://www.google.com",
    userID: "userRandomID",
  }
};

function urlsForUser(id){
  let URLS = []

  for(let url in urlDatabase){
    if(urlDatabase[url].userID === id){

      URLS.push([url, urlDatabase[url].longURL])
    }
  }

  return URLS
}


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
  let user = req.cookies['user_id']
  console.log(users)



    const templateVars = {
        user,
        urls: urlsForUser(user)
     
      };

   console.log(templateVars.user)


    res.render("urls_index", templateVars);
  });

app.get("/u/:id", (req, res) => {
  let ID = req.params.id
    // const longURL = ...
    console.log(urlDatabase.ID)
    if(urlDatabase.ID == undefined){
      res.send("does not work")
    }
    const templateVars = {
        id: ID,
        longURL: urlsForUser[ID].longURL,
        user: req.cookies['user_id']
      };



    res.redirect(longURL, templateVars);
  });

app.get("/urls/new", (req, res) => {
  console.log("new")
    const templateVars = {
        user: req.cookies['user_id']
      }

      if(!templateVars.user){
        return res.render("login", templateVars)
      }

    res.render("urls_new", templateVars);
    
  });

app.get("/urls/:id", (req, res) => {
  console.log("agshshtsahywrhtswrY", req.params.id)
  let ID = req.params.id

  if(urlDatabase[ID] === undefined){
    res.send("does not work")
  }
  if(users[req.cookies['user_id']] === undefined){
    res.send("Log in")
  }
  if(users[!req.cookies['user_id']]){
    res.send("user not loged in")
  }
  const templateVars = {
    id: req.params.id,
    longURL: urlDatabase[req.params.id],
    user: users[req.cookies['user_id']]
  };

    res.render("urls_show", templateVars);

  });

  app.post("/urls", (req, res) => {
    console.log(users); // Log the POST request body to the console
    res.send("Ok"); // Respond with 'Ok' (we will replace this)
  });

  app.post("/urls/:id/delete", (req, res) => {
    let ID = req.params.id

    if(urlDatabase[ID] === undefined){
      res.send("does not work")
    }
    if(!req.cookies['user_id']  === undefined){
      res.send("Log in")
    }
    if(!users[req.cookies['user_id']]){
      res.send("user not loged in")
    } else {
      delete urlDatabase[req.params.id]
    }
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

    if (templateVars.user) {
      return res.redirect("/urls");
    }

    res.render('login', templateVars)
  });

  app.post("/login", (req, res) => {
    const formPassword = req.body.password;
    const hashedPassword = bcrypt.hashSync(formPassword, 10);
    const userEmail = req.body.email;
    const userPassword = req.body.password;
    if (userEmail === '' || userPassword === '') {
      res.status(400);
      res.send('400 Bad request: Please enter a valid email and password');
    }
  // email and password need to match whats in data base 
    for (const i in users) {
      console.log("this ran")
      console.log(users[i].email)
      if ( bcrypt.compareSync(userPassword, hashedPassword) && userEmail === users[i].email) {
        res.cookie("user_id", i)
        res.redirect('/urls');
      } else if (userEmail !== users[i].email) {
        res.status(403)
        res.send("Error 403 Forbidden: Email does not exist. Please try again.")
      } else if (userPassword != users[i].password) {
        res.status(403)
        res.send("Error 403 Forbidden: Incorrect password. Please try again.")
      }
    }
  //if all else fails:
  console.log("failed")
  return res.status(403);

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

      if (templateVars.user) {
        return res.redirect("/urls");
      }

    res.render("register", templateVars)
  })

  app.post('/register', (req, res) => {
    if (req.body.email === '' || req.body.password === '') {
      res.status(400)
      res.send('404 Error: Please enter a valid email and password.');
    }
    else if (exisitingEmailLookup(req.body.email)) {
      res.status(400);
      res.send("400: Email associated with existing account.")
    }
    else {
      const password = req.body.password;
      const hashedPassword = bcrypt.hashSync(password, 10);
      const userID = generateRandomString();
      users[userID] = {
        id: userID,
        email: req.body.email,
        password: hashedPassword
      };
      console.log(users[userID].email)
      res.cookie('user_id', userID);
      res.redirect('/urls');
    }
  
  });


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});