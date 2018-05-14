/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('people', {
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
    tableName: 'people'
  });
};
