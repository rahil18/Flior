// Final project code for CS546
// Tanmay and Xiao have worked on the Front-end of the website 
// Vedant has worked on the Search feature and Static (News) HTML page of the website
// Rahil has worked on the routing and database of the website 


var express = require("express"),
    app = express(),
    mongoose = require("mongoose"),
    bodyParser = require("body-parser"),
    flash = require("connect-flash"),
    passport = require("passport"), 
    LocalStrategy = require("passport-local"),
    methodOverride = require("method-override"),
    event = require("./models/event"),
    Comment = require("./models/comment"), 
    User = require("./models/user");
    // seedDB = require("./seeds")
    xss = require("xss");
   
   
mongoose.connect("mongodb://localhost:/flior");
app.set("view engine", "ejs");                                                  //To enable embedded JavaScript 
app.use(bodyParser.urlencoded ({extended:true})); 
app.use(express.static(__dirname + "/public"));                                 //To enable css stylesheets
app.use(methodOverride("_method"));
app.use(flash());                                                               //To enable flash messages
app.locals.moment = require('moment');
// seedDB();


// PASSPORT CONFIGURATION
app.use(require("express-session")({
    secret: "Shhhh, it's top secret!",
    resave: false,
    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


//middleware for passing currentUser as an object to every route (Used for displaying user name that is logged in and toggling Sign In and Sign up buttons)
app.use(function(req, res, next){          
   res.locals.currentUser = req.user;
   res.locals.error = req.flash("error");
   res.locals.success = req.flash("success");
   next();
});


app.get("/", function(req , res)
{
    res.render("landingPage");
});


//---------------------------------------------------INDEX Route (Shows all the Events)--------------------------------------------------
app.get("/events", function(req, res)
{
       //Get all the events from the DB and render the file.
       event.find({}, function(err, allevents)
       {
           if(err)
           {
               console.log("Error retrieving the events"); 
           }
           else
           {
               res.render("Index", {events:allevents , page: 'events'}); //currentUser object passed to display user that is logged in (passed to the header.ejs)
           }
       });
});

//---------------------------------------------------NEW Route (Shows forms to create Events)--------------------------------------------------
app.get("/events/new", isLoggedIn,  function(req, res) {
    res.render("new.ejs")
});

//---------------------------------------------------CREATE Route (Creates Events)--------------------------------------------------
app.post("/events", isLoggedIn,  function(req, res) 
{
    var name = xss(req.body.name);
    var image = req.body.image;
    // var cost = req.body.cost;
    var description = xss(req.body.description);
    var author = {
            id: req.user._id,
            username: req.user.username
                }
    var newevent = { name : name, image : image, description : description };
    
    event.create({ name: name, image: image, description : description, author:author}, function(err, newlyCreated)
    {
        if(err)
        {
            console.log(err);
        }
        else
        {
            console.log(newlyCreated);
            res.redirect("/events");
        }
    });
    // });
});

//---------------------------------------------------SHOW Route (Shows description about an Event)--------------------------------------------------

app.get("/events/:id", function (req, res) {
    
    event.findById(req.params.id).populate("comments").exec(function(err, foundevent)
    {  
        //Finding the required Event using the ID from the request, injecting Comments and rendering the final page (SHOW)
        if(err)
        {
            console.log("Error adding the event");
        }
        else
        {
            console.log("Found Event");
            res.render("show", {event:foundevent});
        }
    })
});

//---------------------------------------------------Delete Route (Shows all the Events)--------------------------------------------------

app.delete("/events/:id", checkeventOwnership, function(req, res){
    // res.send("Yay deleted a CG");
  event.findByIdAndRemove(req.params.id, function(err){  //mongoose method to delete
      if(err){
          res.redirect("/events");
      } else {
          res.redirect("/events");
      }
  });
});

//---------------------------------------------------Search Route (Searches through all the Events)--------------------------------------------------

app.post("/search", function(req, res)
{
    var e_name = req.body.event_name;
    //    console.log(e_name);

       event.find({}, function(err, allevents)
       {
           if(err)
           {
               console.log("Error retrieving the events"); 
           }
           else
           {
                res.render("search", {events:allevents , search_event:e_name , page: 'search'}); //currentUser object passed to display user that is logged in (passed to the header.ejs)
           }
       });
});


//---------------------------------------------------Comments Route (Shows all the Events)--------------------------------------------------

app.get("/events/:id/comments/new", isLoggedIn,  function(req, res) { //islogged in used to check if a user is logged in before commenting
    event.findById(req.params.id, function(err, event)
    {
        if(err)
        {
            console.log(err);
        }
        else
        {
             res.render("comments/new", {event: event});
        }
    })
   
});

app.post("/events/:id/comments", isLoggedIn, function(req, res) {
    event.findById(req.params.id, function(err, event) //Finding the correct event using the ID
    {
        if(err)
        {
            console.log(err);
            res.redirect("/events");
        }
        else
        {
            Comment.create(req.body.comment, function(err, comment) //Creating a comment after finding the event
             {
                 if(err)
                 {
                     req.flash("error", "Unable to add the comment!");
                     console.log(err)
                 }
                 else
                 {                                                  
                    comment.author.id = req.user._id;                   //add username and id to comment
                    comment.author.username = req.user.username;
                                                                    
                    comment.save();
                    event.comments.push(comment);                       //Pushing the comment in the event 
                    event.save();                                       //Saving
                    console.log(comment);
                    req.flash("success", "Successfully added comment!");
                    res.redirect("/events/" + event._id)
                 }
             })
        }
    })
});

//---------------------------------------------------Comment Delete (Shows all the Events)--------------------------------------------------


app.delete("/events/:id/comments/:comment_id", checkCommentOwnership, function(req, res){
   
    Comment.findByIdAndRemove(req.params.comment_id, function(err){
       if(err){
           res.redirect("back");
       } else {
           req.flash("success", "Successfully deleted a comment!");
           res.redirect("/events/" + req.params.id);
       }
    });
});

//---------------------------------------------------Authentication Routes--------------------------------------------------------------------

//show the register form

app.get("/register", function(req, res) {
    res.render("register", {page: 'register'}); 
});

//handle sign up logic 

app.post("/register", function(req, res){
    var newUser = new User({username: xss(req.body.username)});
	    User.register(newUser, xss(req.body.password), function(err, user){  //Inherent passport method .register of mongoose to register new users
        if(err){
            req.flash("error", "No Username/Password was given");
            return res.render("register");
        }
        passport.authenticate("local")(req, res, function(){
            req.flash("success", "Welcome to Flior!" + " " + user.username);
            res.redirect("/events"); 
        });
    });
});

//---------------------------------------------------Login Route (how login form)--------------------------------------------------

app.get("/login", function(req, res){
   res.render("login", {page: 'login'}); 
});

app.post("/login", passport.authenticate("local",   //Using passport.authenticate middleware to login 
    {
        successRedirect: "/events",                 //On a successfull redirection 
        failureRedirect: "/login",                  //On an unsuccessfull redirection 
	    failureFlash:"Please check your username or password"
    }), function(req, res){
});

//---------------------------------------------------Logout Route (how login form)--------------------------------------------------

app.get("/logout", function(req, res){
   req.logout();
   req.flash("success", "Logged out!");
   res.redirect("/events");
});

//---------------------------------------------------Middleware to enable comments add only when logged in--------------------------------------------------


function isLoggedIn(req, res, next){
    if(req.isAuthenticated()){
        return next();
    }
    req.flash("error", "You need to be logged in!");
    res.redirect("/login");
}

function checkeventOwnership(req, res, next) {
 if(req.isAuthenticated()){
        event.findById(req.params.id, function(err, foundevent){
           if(err){
               req.flash("error", "Event Not Found!");
               res.redirect("back");
           }  else {
               // Checking if the user owns the event
            if(foundevent.author.id.equals(req.user._id)) {
                next();
            } else {
                req.flash("error", "You dont have permission to access this!");
                res.redirect("back");
            }
           }
        });
    } else {
        req.flash("error", "You need to be logged in!");
        res.redirect("back");
    }
}

function checkCommentOwnership(req, res, next) {
 if(req.isAuthenticated()){
        Comment.findById(req.params.comment_id, function(err, foundComment){
           if(err){
               res.redirect("back");
           }  else {
               // Checking if the user owns the comment
            if(foundComment.author.id.equals(req.user._id)) {
                next();
            } else {
                req.flash("error", "You dont have permission to access this!");
                res.redirect("back");
            }
           }
        });
    } else {
        req.flash("error", "You need to be loggen in!");
        res.redirect("back");
    }
}


app.listen(3000, function()
{
    console.log("Events Server has started......"); 
    console.log("Your routes will be running on http://localhost:3000");

});

