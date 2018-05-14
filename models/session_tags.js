/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('session_tags', {
    session_id: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      primaryKey: true
    },
    tag: {
      type: DataTypes.STRING(50),
      allowNull: false,
      primaryKey: true
    }
  }, {
    tableName: 'session_tags'
  });
};
