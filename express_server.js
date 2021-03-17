const express = require("express");
const app = express();
const PORT = 8080;//default port
const bodyParser = require("body-parser"); // miidleware
const cookieParser =require("cookie-parser");//middleware cookie parser
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());
app.set("view engine", "ejs");

let users = { //users database
  "userRandomID": {
    id: "userRandomID", 
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
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};
const  generateRandomString = function () { // generates random string of 6 length.
  return (Math.random().toString(36).substring(2,8));
};
app.get("/urls", (req, res) => {//urls page
  let currentuser = {};
  for (const user in users){// finding user object from  users for passing to header
    if (user === req.cookies.userid) {
      currentuser = users[user];
    }
  }
  res.render("urls_index", {urlDatabase:urlDatabase,currentuser: currentuser});
});
app.get("/urls/new", (req, res) => { // generates a form for newURL
  let currentuser = {};
  for (const user in users){// finding user object from  users for passing to header
    if (user === req.cookies.userid) {
      currentuser = users[user];
    }
  }
  res.render("urls_new",{currentuser:currentuser});
});
app.get("/urls/:shortURL", (req, res) => {// shows the page what the shortURL corresponds to
  let currentuser = {};
  for (const user in users){// finding user object from  users for passing to header
    if (user === req.cookies.userid) {
      currentuser = users[user];
    }
  }
  const templateVars = { shortURL: req.params.shortURL, longURL:urlDatabase [`${req.params.shortURL}`],currentuser:currentuser};
  if (templateVars.longURL !== undefined){
   res.render("url_show", templateVars);
  } else 
  res.sendStatus(404);
});
app.post("/urls", (req, res) => {
  let shortURL = generateRandomString();
  urlDatabase[shortURL] = req.body.longURL;
  res.redirect(`urls/${shortURL}`);         //Redirect the page to the shortURL
});
app.get("/u/:shortURL", (req, res) => { // Redirect the shortURL to actual web page
  const longURL = urlDatabase [`${req.params.shortURL}`];
  res.redirect(longURL);
});

app.post("/urls/:shortURL/delete",(req,res)=>{// delete a particular shortURL from the url Database.
  const id =req.params.shortURL;
  delete urlDatabase[id];
  res.redirect("/urls");

})
app.post("/urls/:shortURL/edit",(req,res)=> { //edit the long url and redirect to Myurl Page.
  const shortURL = req.params.shortURL;
  urlDatabase[shortURL]=req.body.longURL;
  res.redirect("/urls");

});
app.post("/login",(req,res)=>{// login route using res.cookies
  res.cookie("username",req.body.username);
  res.redirect("/urls");
});

app.post("/logout",(req,res)=>{
  res.clearCookie("userid");
  res.redirect("/urls");
})
// route for Register

app.get("/register",(req,res)=>{
  res.render("urls_register");
})

//Register Handler for register request

app.post("/register",(req,res)=>{
  const newuserid = generateRandomString();
  const newuser = {"id":newuserid , "email":req.body.email , "password" : req.body.password};
  users[newuserid] = newuser;
  res.cookie("userid",newuserid);
  res.redirect("/urls");
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



