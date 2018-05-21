// Requiring path to so we can use relative routes to our HTML files
var path = require("path");
var db = require("../models");
var moment = require("moment");

//Store operations
var Sequelize = require('sequelize');
var Op = Sequelize.Op



// Requiring our custom middleware for checking if a user is logged in
var isAuthenticated = require("../config/middleware/isAuthenticated");

module.exports = function (app) {

  app.get("/", function (req, res) {
    // If the user already has an account send them to the members page
    if (req.user) {
      return res.redirect("/all-sessions");
    }
    res.sendFile(path.join(__dirname, "../public/html/index.html"));
  });

  app.get("/login", function (req, res) {
    // If the user already has an account send them to the members page
    if (req.user) {
      return res.redirect("/all-sessions");
    }
    res.sendFile(path.join(__dirname, "../public/html/login.html"));
  });

  app.get("/signup", function (req, res) {
    // If the user already has an account send them to the members page
    if (req.user) {
      return res.redirect("/all-sessions");
    }
    res.sendFile(path.join(__dirname, "../public/html/signup.html"));
  });

  // Here we've add our isAuthenticated middleware to this route.
  // If a user who is not logged in tries to access this route they will be redirected to the signup page
  app.get("/all-sessions", isAuthenticated, function (req, res) {
    console.log("req======================");
    console.log(req.body);
    console.log(req.user);
    console.log("res======================");
    console.log(res);
    console.log("end res======================");

    db.sessions.findAll({
      where: {
        item_date: {
          [Op.gte]: moment()
        }
      },
     // order: ["item_date", "DESC"],
      include: [{
        model: db.People,
        required: true,
        // include: [{
        //     model: db.people_session,
        //     required: false,
        //   //   where: {
        //   //     session_id: this.id
        //   //   }
        //   }],
      }],
      // include: [{
      //   model: db.people_session,
      //   required: false,
      //   where: {
      //     session_id: this.id
      //   }
      // }],

    }).then(function (result) {
     // console.log("result ======================");
      for (let i = 0; i < result.length; i++) {
        const row = result[i];
      //  console.log(i);
       // console.log(row);
        //let row = row.dataValues;
        let myDate = moment(row.item_date).format("MMMM Do YYYY, h:mm a");
        row.dateFormated = myDate;
      //  console.log(row.dateFormated);
        // data.session_date = 
      }

    //  console.log("END result ======================");
      var sessions = {
        title: "All Sessions",
        role: req.user.role,
        username: req.user.fst_nam + " " + req.user.lst_nam,
        logon_id2: String(req.user.logon_id),
        user_id: req.user.id,
        isHost: req.user.role === 'host' ? true : false,
        sessions: result,
      };
      console.log("sessions ======================");
      console.log(sessions);
      console.log("END result ======================");

      res.render('all-sessions', sessions);
    });
  });
  app.get("/create-session", function(req,res){
    res.sendFile(path.join(__dirname, "../public/html/createSession.html"));
  });
};