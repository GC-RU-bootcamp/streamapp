/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('host_profile', {
    people_id: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      primaryKey: true,
      references: {
        model: 'People',
        key: 'id'
      }
    },
    avg_rating: {
      type: DataTypes.DECIMAL,
      allowNull: true
    },
    bio: {
      type: DataTypes.STRING(2000),
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
    },
    photo: {
      type: "BLOB",
      allowNull: true
    }
  }, {
    tableName: 'host_profile'
  });
};
