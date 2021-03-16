const express = require("express");
const app = express();
const PORT = 8080;//default port
const bodyParser = require("body-parser"); //
app.use(bodyParser.urlencoded({extended: true}));

app.set("view engine", "ejs");

let urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};
const  generateRandomString = function () { // generates random string of 6 length.
  return (Math.random().toString(36).substring(2,8));
};
app.get("/urls", (req, res) => {
  res.render("urls_index", {urlDatabase:urlDatabase});
});
app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});
app.get("/urls/:shortURL", (req, res) => {// shows the page what the shortURL corresponds to
  const templateVars = { shortURL: req.params.shortURL, longURL:urlDatabase [`${req.params.shortURL}`]};
   res.render("url_show", templateVars);
});
app.post("/urls", (req, res) => {
  let shortURL = generateRandomString();
  urlDatabase[shortURL] = req.body.longURL;
  res.redirect(`urls/${shortURL}`);         //Redirect the page to the shortURL
});
app.get("/", (req, res) => {
  res.send("Hello!");
});
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});
app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});



