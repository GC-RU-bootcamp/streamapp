
var db = require("../models");

//Store operations
var Sequelize = require('sequelize');
var Op = Sequelize.Op

//Require momentjs
var moment = require('moment');

module.exports = function (app) {

app.get("/my-sessions", function(req, res){
  console.log("my-sessions req======================");
  console.log(req.body);
  console.log(req.user);
  console.log("my-sessions res======================");
  console.log(res);
  console.log("my-sessions end res==================");

  db.sessions.findAll({
    attributes: ['conn_info', 'name', 'item_date', 'description'],
    where:{
      people_id: req.user.id,
      item_date: {
        [Op.gte]: moment()
      }
    }, 
    include : [
       {model: db.people_session, required: false, attributes: ['people_id','session_id'],
        include: [
          {
            model: db.People, required: false, attributes: ['logon_id','lst_nam','fst_nam','id']
          }
        ]
       }
    ],
    order: [
         ['item_date', 'ASC']
       ]
  }).then(sessions => {
      const hostSessions = sessions.map(session => {

        //tidy up the session data

        return Object.assign(
          {},
          {
            conn_info: session.conn_info,
            name: session.name,
            item_date: session.item_date,
            description : session.description,
            attends: session.attends.map(People => {

              //tidy up the post data
              return Object.assign(
                {},
                {
                  logon_id: People.logon_id,
                  lst_nam: People.lst_nam,
                  fst_nam: People.fst_nam
                }
                )
            })
          }
        )
      });
      // res.json(resObj)
      console.log(hostSessions);
      res.render("hostSession", hostsessions);
    }).catch(function(){
       res.status(500).end();
    });
  });
};