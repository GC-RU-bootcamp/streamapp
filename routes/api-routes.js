// import formidable
var formidable = require('formidable');
var cloudinary = require('cloudinary');
require('dotenv').config();

// Requiring our models and passport as we've configured it
var db = require("../models");
var passport = require("../config/passport");

//Require uuid
var uuidv4 = require('uuid/v4');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

//Store operations
var Sequelize = require('sequelize');
var Op = Sequelize.Op

//Require momentjs
var moment = require('moment');

module.exports = function (app) {
  // Using the passport.authenticate middleware with our local strategy.
  // If the user has valid login credentials, send them to the members page.
  // Otherwise the user will be sent an error
  app.post("/api/login", passport.authenticate("local"), function (req, res) {
    // Since we're doing a POST with javascript, we can't actually redirect that post into a GET request
    // So we're sending the user back the route to the members page because the redirect will happen on the front end
    // They won't get this or even be able to access this page if they aren't authed
    
    // console.log(req.user);
    // console.log(req.body);
    res.json("/all-sessions");
  });



  /*

  Route for signing up a user. Since we are sending an image with the POST request, we cannot use body-parser since it cannot read the file's data, so we use Formidable instead. 

  Once we parse out the form and extract the image's data, we send that image's data to Cloudinary. When it's done uploading there, it executes our callback function and includes all of the newly uploaded image's data so we can use that URL to store in the user's table.
  
  The user's password is automatically hashed and stored securely thanks to how we configured our Sequelize User Model. If the user is created successfully, proceed to log the user in, otherwise send back an error 
  
  */
  app.post("/api/signup", function (req, res) {

    // Create a new instance of formidable to handle the request info
    var form = new formidable.IncomingForm();

    // parse information for form fields and incoming files
    form.parse(req, function (err, fields, files) {
      console.log(fields);
      console.log(files.photo);

      /* IF PHOTO/FILE EXISTS */
      if (files.photo) {
        // upload file to cloudinary, which'll return an object for the new image
        cloudinary.uploader.upload(files.photo.path, function (result) {
          console.log(result);
          // create new user
          db.People.create({
            logon_id: fields.logonId,
            logon_pwd: fields.password,
            fst_nam: fields.fstNam,
            lst_nam: fields.lstNam,
            email_adr: fields.email,
            cell_phone: fields.cell,
            role: fields.role,
            created_by: fields.createdBy,
            photo: result.secure_url
          }).then(function (userInfo) {
            // Upon successful signup, log user in
            req.login({username: userInfo.logon_id, 
                       password: userInfo.logon_pwd}, function (err) {
              if (err) {
                console.log(err)
                return res.status(422).json(err);
              }
              console.log(req.user);
              res.json("/all-sessions");
            });
          }).catch(function (err) {
            console.log(err)
            res.status(422).json(err);
          });
        });
        /* IF NO PHOTO/FILE */
      } else {
        db.People.create({
          logon_id: fields.logonId,
          logon_pwd: fields.password,
          fst_nam: fields.fstNam,
          lst_nam: fields.lstNam,
          email_adr: fields.email,
          cell_phone: fields.cell,
          role: fields.role,
          created_by: fields.createdBy
      }).then(function (userInfo) {
         // Upon successful signup, log user in
         req.login(userInfo, function (err) {
           if (err) {
             console.log(err)
             return res.status(422).json(err);
           }
           console.log(req.user);
           return res.json("/all-sessions");
         });
        }).catch(function (err) {
          console.log(err);
          res.status(422).json(err);
        });
      }
    });

  });

  // Route for logging user out
  app.get("/logout", function (req, res) {
    req.logout();
    res.redirect("/");
  });

  // Route for getting some data about our user to be used client side
  app.get("/api/user_data", function (req, res) {
    if (!req.user) {
      // The user is not logged in, send back an empty object
      res.json({});
    } else {
      // Otherwise send back the user's email and id
      // Sending back a password, even a hashed password, isn't a good idea
      res.json({
        email: req.user.email,
        id: req.user.id,
        photo: req.user.photo
      });
    }
  });

  // Route for posting a new session to the database
  app.post("/api/host/create-session", function (req, res){
    if(!req.user){
      res.status(403).end();
    }
    else{
      var newSession = req.body;
      var builtSession = {
        people_id: req.user.id,
        name: newSession.name,
        description: newSession.description,
        item_date: newSession.item_date,
        cost: newSession.cost,
        min_attendees: newSession.min_attendees,
        max_attendees: newSession.max_attendees,
        confirmed: newSession.confirmed,
        conn_info: uuidv4(),
        created_by: req.user.created_by
      };
  
      //On post create a uuid for the session
      db.sessions.create(builtSession).then(function(){
        res.status(201).end();
      }).catch(function(){
        res.status(500).end();
      });
    }
  });

  //Route fpr getting back all the host's available sessions
  app.get("/api/host/my-sessions", function(req, res){
    db.sessions.findAll({
      where:{
        people_id: req.user.id,
        item_date: {
          [Op.gte]: moment()
        }
      }
    }).then(function(result){
      res.json(result);
    }).catch(function(){
      res.status(500).end()
    })
  });

  //Route for getting back all the sessions in the db
  app.get("/api/host/show-sessions", function(req, res){
    if(!req.user){
      res.status(403).end();
    }
    else{
      db.sessions.findAll().then(function(result){
        res.json(result);
      });
    }
  });

  //Route fpr getting back all the host's past sessions
  app.get("/api/host/session-history", function(req, res){
    db.sessions.findAll({
      where:{
        people_id: req.user.id,
        item_date: {
          [Op.lt]: moment()
        }
      }
    }).then(function(result){
      res.json(result);
    }).catch(function(){
      res.status(500).end()
    })
  });

  //Route for getting back one session by it's ID
  app.get("/api/host/:sessionID", function(req, res){
    db.sessions.findOne({
      where:{
        id: req.params.sessionID
      }
    }).then(function(result){
      res.json(result);
    }).catch(function(){
      res.status(500).end()
    })
  });

  // TO-DO || Add functionality to cancel a session that a person is attending 
  //       || You cannot currently delete a session that someon is attending
  //Route for deleting a specific session
  app.delete("/api/host/my-sessions/:sessionID", function(req, res){
    db.sessions.destroy({
      where:{
        id: parseInt(req.params.sessionID)
      }
    }).then(function(){
      res.status(204).end();
    }).catch(function(err){
      console.log(err);
      res.status(500).end();
    })
  });
  
  //Route for attending a pre-made session
 // app.post("/api/client/attend", function(req, res){
  app.post("/api/client/register", function(req, res){
    db.people_session.create({
      people_id: req.body.user_id,
      session_id: req.body.session_id,
      created_by: req.body.logon_id
    }).then(function(){
      // return res.redirect("/all-sessions");
      res.json("/all-sessions");
      // res.status(201).end();
    }).catch(function(){
      res.status(500).end();
    })
  });

    //Route for attending a pre-made session
    app.post("/api/client/cancel", function(req, res){
      db.people_session.destroy({
        where: {
          people_id: req.body.user_id,
          session_id: req.body.session_id
          // session_id: req.body.session_id,
        // created_by: req.body.logon_id
      }
    }).then(function(){
      // return res.redirect("/all-sessions");
      res.json("/all-sessions");
      // res.status(204).end();
        // res.status(201).end();
      }).catch(function(){
        res.status(500).end();
      })
    });

  //Route for getting all the session a person is going to attend
  app.get("/api/client/my-sessions", function(req, res){
    db.people_session.findAll({
      where:{
        people_id: req.user.id
      },
      // this was only returning the host's sessions
      // include: [{
      //   model: db.sessions,
      //   where: {
      //     people_id: req.user.id,
      //     item_date: {
      //       [Op.gte]: moment()
      //     }
      //   }
      // }]
    }).then(function(result){
      res.json(result);
    }).catch(function(){
      res.status(500).end()
    })
  });

  //Route for getting all the sessions back in the db
  app.get("/api/client/show-sessions", function(req, res){
    if(!req.user){
      res.status(403).end();
    }
    else{
      db.sessions.findAll().then(function(result){
        res.json(result);
      });
    }
  });

  //Route for getting back all the sessions a client has attended
  app.get("/api/client/session-history", function(req,res){
    db.people_session.findAll({
      where:{
        people_id: req.user.id
      },
      include: [{
        model: db.sessions,
        where: {
          people_id: req.user.id,
          item_date: {
            [Op.lt]: moment()
          }
        }
      }]
    }).then(function(result){
      res.json(result);
    }).catch(function(){
      res.status(500).end()
    })
  });

  //Route for getting a specific session back
  app.get("/api/client/session/:sessionID", function(req,res){
    db.sessions.findOne({
      where:{
        id: req.params.sessionID
      }
    }).then(function(result){
      res.json(result);
    }).catch(function(){
      res.status(500).end()
    })
  });

  //Route for checking whether req.user is the host
  app.get("/api/session/:uuid", function(req,res){
    db.sessions.findOne({
      where:{
        conn_info: req.params.uuid
      }
    }).then(function(result){
      if(req.user.id === result.people_id){
        res.json({
          isHost: 1
        })
      } else{
        res.json({
          isHost: 0
        })
      }
    }).catch(function(){
      res.status(500).end()
    })
  });
};