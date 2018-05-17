var bcrypt = require("bcrypt-nodejs");

module.exports = function(sequelize, DataTypes) {
  var People = sequelize.define('People', {
    id: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    logon_id: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    logon_pwd: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    fst_nam: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    lst_nam: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    email_adr: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    cell_phone: {
      type: DataTypes.STRING(20),
      allowNull: false
    },
    role: {
      type: DataTypes.STRING(30),
      allowNull: false
    },
    acct_lock: {
      type: DataTypes.INTEGER(1),
      allowNull: true
    },
    photo: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: sequelize.literal('CURRENT_TIMESTAMP')
    },
    created_by: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    lst_mod_at: {
      type: DataTypes.DATE,
      allowNull: true
    },
    lst_mod_by: {
      type: DataTypes.STRING(50),
      allowNull: true
    }
  }, {
    timestamps: false
  });

  People.prototype.validPassword = function(password) {
     return bcrypt.compareSync(password, this.logon_pwd);
  };

  People.hook("beforeCreate", function(People) {
     People.logon_pwd = bcrypt.hashSync(People.logon_pwd, bcrpyt.genSaltSync('10'), null);
  });
 

  People.prototype.createUser = function(newUser, callback){
    bcrypt.genSalt(10, function(err, salt) {
        bcrypt.hash(newUser.logon_pwd, salt, function(err, hash) {
            newUser.logon_pwd = hash;
            newUser.save(callback);
        });
    });
  };
  
  People.prototype.getUserByUsername = function(logon_id, callback){
    var query = {logon_id: logon_id};
    People.findOne(query, callback);
  };
  
  People.prototype.getUserById = function(id, callback){
    People.findById(id, callback);
  };
  
  People.prototype.comparePassword = function(candidatePassword, hash, callback){
    bcrypt.compare(candidatePassword, hash, function(err, isMatch) {
        if(err) throw err;
        callback(null, isMatch);
    });
  };

  return People;

};
