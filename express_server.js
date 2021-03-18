const express = require("express");
const app = express();
const PORT = 8080;//default port
const bodyParser = require("body-parser"); // miidleware
const cookieParser = require("cookie-parser");//middleware cookie parser
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.set("view engine", "ejs");

let users = { //users database
  "abxcdf": {
    id: "abxcdf",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
};

let urlDatabase = {
  "b2xVn2": {longURL:"http://www.lighthouselabs.ca", userId : "abxcdf"},
  "9sm5xK": {longURL:"http://www.google.com" , userId: "abxcdf"}
};
const generateRandomString = function () { // generates random string of 6 length.
  return (Math.random().toString(36).substring(2, 8));
};

const userAlreadyRegistered = function (newuseremail) {//check userAlreadyregistered and returns true if not fregistered and returns false if registered.
  for (const user in users) {
    if (users[user].email === newuseremail) {
      return false;
    }
  }
  return true;
}
const urlsForUser = function(id){// Filters the user generated URLs on the basis of id and then sends them back
  const userurls ={};
  for (const url in urlDatabase) {
  if(urlDatabase[url]["userId"]=== id) {
  userurls[url] =urlDatabase[url];
  }}
  return userurls;

}

app.get("/urls", (req, res) => {//urls page displays msg to if not logged in otherwise displays the urls ;
 const userurls= urlsForUser(req.cookies.userid);
  res.render("urls_index", { userurls: userurls, user: users[req.cookies.userid] });//sends only user generated urls.
});
app.get("/urls/new", (req, res) => { // generates a form for newURL+*-
  const userId = req.cookies.userid;// checks whether user is logged in or not Only registered users can create url 
  if(userId !== undefined){
  res.render("urls_new", { user: users[req.cookies.userid] });
  } else 
  res.redirect("/login");
});

app.get("/urls/:shortURL", (req, res) => {// shows the page what the shortURL corresponds to shorturl  if user logged in otherwise prompt to login or messages that they don't own the url.
  const userurls= urlsForUser(req.cookies.userid)
 
  if(userurls[`${req.params.shortURL}`]) {
  const templateVars = { shortURL: req.params.shortURL, longURL: userurls[`${req.params.shortURL}`]["longURL"], user: users[req.cookies.userid] };
    res.render("url_show", templateVars);
  }else {
    const templateVars = { shortURL: req.params.shortURL, longURL: undefined, user: users[req.cookies.userid] };
    res.render("url_show", templateVars);
  }
});
app.post("/urls", (req, res) => {
  let shortURL = generateRandomString();
  let newShortURl= {longURL :req.body.longURL, userId : req.cookies.userid};
  urlDatabase[shortURL] = newShortURl;
  res.redirect(`urls/${shortURL}`);         //Redirect the page to the shortURL
});
app.get("/u/:shortURL", (req, res) => { // Redirect the shortURL to actual web page
  const longURL = urlDatabase[`${req.params.shortURL}`]["longURL"];
  res.redirect(longURL);
});

app.post("/urls/:shortURL/delete", (req, res) => {// delete a particular shortURL from the url Database only users who created can do that 
  const userurls = urlsForUser(req.cookies.userid);
  if(userurls[`${req.params.shortURL}`]) {// can delete only urls created by user
  const id = req.params.shortURL;
  delete urlDatabase[id];
  }
  res.redirect("/urls");

})
app.post("/urls/:shortURL/edit", (req, res) => { //edit the long url and redirect to Myurl Page.
  const userurls = urlsForUser(req.cookies.userid);
  if(userurls[`${req.params.shortURL}`]) {//can edit only url created by user
  const shortURL = req.params.shortURL;
  urlDatabase[shortURL]["longURL"] = req.body.longURL;
  res.redirect("/urls");
  }

});

//login 
//route for login
app.get("/login", (req, res) => {
  res.render("urls_login", { user: users[req.cookies.userid] });
});
//Login Handler
app.post("/login", (req, res) => {// login route using res.cookies
  const checkemail = userAlreadyRegistered(req.body.email);
  let passwordmatch = false;
  let userid;
  if (!checkemail) {
    for (const user in users) {
      if (users[user]["email"] === req.body.email && users[user]["password"] === req.body.password) {
        passwordmatch = true;
        userid = users[user]["id"];
      }
    }
    if (passwordmatch) {
      res.cookie("userid", userid);
      res.redirect("/urls");
    } else {
      res.sendStatus(403);
    }

  } else {
    res.sendStatus(403);
  }
});
//logout handler
app.post("/logout", (req, res) => {
  res.clearCookie("userid");
  res.redirect("/urls");
})
// route for Register

app.get("/register", (req, res) => {
  res.render("urls_register", { user: users[req.cookies.userid] });
})

//Register Handler for register request

app.post("/register", (req, res) => {
  const newuserid = generateRandomString();
  if (req.body.email && req.body.password) {
    const checkemail = userAlreadyRegistered(req.body.email);// check useer already registered
    if (checkemail) {
      const newuser = { "id": newuserid, "email": req.body.email, "password": req.body.password };
      users[newuserid] = newuser;
      res.cookie("userid", newuserid);
      res.redirect("/urls");
    } else {
      res.sendStatus(400);
    }
  } else {
    res.sendStatus(400);
  }
});

// app.get("/", (req, res) => {
//   res.send("Hello!");
// });
// app.get("/urls.json", (req, res) => {
//   res.json(urlDatabase);
// });
// app.get("/hello", (req, res) => {
//   res.send("<html><body>Hello <b>World</b></body></html>\n");
// });

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});



