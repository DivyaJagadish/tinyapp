// TinyApp which shortens longurl to shorturl. Allows user to register an account login and make customized changes.
const express = require("express");
const userAlreadyRegistered = require("./helpers.js"); // Function which returns user object by emailId
const app = express();
const PORT = 8080;//default port

//// Middle ware
const bodyParser = require("body-parser");
const bcrypt = require('bcrypt');
var cookieSession = require('cookie-session')
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieSession({
  name: 'TinyApp',
  keys: ["hello", "world"]
}));
app.set("view engine", "ejs");

//// databases
//users database with data of users.
let users = {
  "abxcdf": {
    id: "abxcdf",
    email: 'user@example.com',
    password: '$2b$10$4L816sgoOqvQRAWM8dzKEeXXu/h6BxNwP3VznBPN0Zn6DIOCzdOXC'
  },
  "546pk6": {
    id: '546pk6',
    email: 'user1@example.com',
    password: '$2b$10$Gp2YgGqqsG2lSr.hmn6HJ.5S58neKLMk1MKleBZfeiI3BvVYBo5xG'
  },
};

//Database of URLs which gets updated with new URLs corresponding shorturl and userId

let urlDatabase = {
  "b2xVn2": { longURL: "http://www.lighthouselabs.ca", userid: "abxcdf" },
  "9sm5xK": { longURL: "http://www.google.com", userid: "abxcdf" }
};

///Functions
// function which generates random string of length 6.

const generateRandomString = function () {
  return (Math.random().toString(36).substring(2, 8));
};

// Filters the user generated URLs on the basis of id and returns it.
const urlsForUser = function (id) {
  const userurls = {};
  for (const url in urlDatabase) {
    if (urlDatabase[url]["userid"] === id) {
      userurls[url] = urlDatabase[url];
    }
  }
  return userurls;
}

///// Routes
// Route for Home redirects to login if not loggedin otherwise redirects to /urls page;
app.get("/", (req, res) => {
  if (req.session.userid) {
    res.redirect("/urls");
  } else {
    res.redirect("/login");
  }
});
//urls page displays  list of user's shotened url otherwise displays the message to login or register.
app.get("/urls", (req, res) => {
  ;
  const userurls = urlsForUser(req.session.userid);
  res.render("urls_index", { userurls: userurls, user: users[req.session.userid] });//sends only user generated urls.
});

// Route for generating a  new shortUrl

app.get("/urls/new", (req, res) => {
  const userid = req.session.userid;// checks whether user is logged in or not Only registered users can create url 
  if (userid !== undefined) {
    res.render("urls_new", { user: users[req.session.userid] });
  } else
    res.redirect("/login");
});

// shows the page what the shortURL corresponds to or messages that they don't own the url ,if user logged in otherwise display a message  to login.
app.get("/urls/:shortURL", (req, res) => {
  const userurls = urlsForUser(req.session.userid)
  if (userurls[`${req.params.shortURL}`]) {
    const templateVars = { shortURL: req.params.shortURL, longURL: userurls[`${req.params.shortURL}`]["longURL"], user: users[req.session.userid] };
    res.render("url_show", templateVars);
  } else {
    const templateVars = { shortURL: req.params.shortURL, longURL: undefined, user: users[req.session.userid] };
    res.render("url_show", templateVars);
  }
});
// Redirects to actual webpage on clicking short url.
app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[`${req.params.shortURL}`]["longURL"];
  res.redirect(longURL);
});


// /urls Handler
app.post("/urls", (req, res) => {
  let shortURL = generateRandomString();
  let newShortURl = { longURL: req.body.longURL, userid: req.session.userid };
  urlDatabase[shortURL] = newShortURl;
  res.redirect(`urls/${shortURL}`);         //Redirect the page to the shortURL
});


///// Delete Handler
app.post("/urls/:shortURL/delete", (req, res) => {// delete a particular shortURL from the url Database only users who created can do that 
  const userurls = urlsForUser(req.session.userid);
  if (userurls[`${req.params.shortURL}`]) {// can delete only urls created by user
    const id = req.params.shortURL;
    delete urlDatabase[id];
  }
  res.redirect("/urls");
});

////EDIT Handler
app.post("/urls/:shortURL/edit", (req, res) => { //edit the long url and redirect to Myurl Page.
  const userurls = urlsForUser(req.session.userid);
  if (userurls[`${req.params.shortURL}`]) {//can edit only url created by user
    const shortURL = req.params.shortURL;
    urlDatabase[shortURL]["longURL"] = req.body.longURL;
  }
  res.redirect("/urls");

});

//login 
//route for login
app.get("/login", (req, res) => {
  if (req.session.userid) {
    res.redirect("/urls");
  } else {
    res.render("urls_login", { user: users[req.session.userid] });
  }
});
//Login Handler
app.post("/login", (req, res) => {// login route using res.cookies
  const user = userAlreadyRegistered(req.body.email, users);
  let userid, passwordmatch;
  if (user) {
    passwordmatch = bcrypt.compareSync(req.body.password, user["password"]);// check whether entered password matches the actual saved password  
    userid = user["id"];
    if (passwordmatch) {
      req.session.userid = userid
      res.redirect("/urls");
    } else {
      res.status(403).send("Password don't match");
    }
  } else {
    res.status(403).send("User not exist.Please Register to continue");
  }
});
//logout handler
app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/urls");
})

////REGISTER
// route for Register

app.get("/register", (req, res) => {
  if (req.session.userid) {
    res.redirect("/urls");
  } else {
    res.render("urls_register", { user: users[req.session.userid] });
  }
})

//Register Handler for register request

app.post("/register", (req, res) => {
  const newuserid = generateRandomString();
  if (req.body.email && req.body.password) {
    const user = userAlreadyRegistered(req.body.email, users);// check useer already registered
    if (!user) {
      const hashedPassword = bcrypt.hashSync(req.body.password, 10);//hashing the password.
      const newuser = { "id": newuserid, "email": req.body.email, "password": hashedPassword }
      users[newuserid] = newuser;
      req.session.userid = newuserid;
      res.redirect("/urls");
    } else {
      res.status(400).send("User already Registered!Please login");
    }
  } else {
    res.status(400).send("Email-id and Password required !");
  }
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});



