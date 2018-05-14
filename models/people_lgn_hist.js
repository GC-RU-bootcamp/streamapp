/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('people_lgn_hist', {
    id: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    people_id: {
      type: DataTypes.INTEGER(11),
      allowNull: false
    },
    logon_id: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: sequelize.literal('CURRENT_TIMESTAMP')
    },
    created_by: {
      type: DataTypes.STRING(50),
      allowNull: false
    }
  }, {
    tableName: 'people_lgn_hist'
  });
};
