const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const cookieParser = require('cookie-parser')

function generateRandomString() {}

app.set("view engine", "ejs");

app.use(express.urlencoded({ extended: true }));
app.use(cookieParser())

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
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
        username: req.cookies['username']
      };

    res.render("urls_index", templateVars);
  });

app.get("/u/:id", (req, res) => {
    // const longURL = ...
    const templateVars = {
        id: req.params.id,
        longURL: urlDatabase[req.params.id],
        username: req.cookies['username']
      };
    res.redirect(longURL, templateVars);
  });

app.get("/urls/new", (req, res) => {
    const templateVars = {
        username: req.cookies['username']
      }
    res.render("urls_new", templateVars);
  });

app.get("/urls/:id", (req, res) => {
    const templateVars = { id: req.params.id, longURL: urlDatabase[req.params.id]};
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

  app.post("/login", (req, res) => {
  
    res.cookie("username", req.body.username);
    console.log(req.body)
    
    res.redirect("/urls");
  })

  app.post("/logout", (req, res) => {
    res.clearCookie("username")
    res.redirect('/urls')
  })


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});