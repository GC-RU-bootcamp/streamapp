/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('people_session', {
    people_id: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      primaryKey: true,
      references: {
        model: 'People',
        key: 'id'
      }
    },
    session_id: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      primaryKey: true,
      references: {
        model: 'sessions',
        key: 'id'
      }
    },
    comment: {
      type: DataTypes.STRING(2000),
      allowNull: true
    },
    rating: {
      type: DataTypes.INTEGER(11),
      allowNull: true
    },
    attended: {
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
    tableName: 'people_session'
  });
};
