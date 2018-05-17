/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('sessions', {
    id: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    people_id: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      references: {
        model: 'People',
        key: 'id'
      }
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    description: {
      type: DataTypes.STRING(2000),
      allowNull: false
    },
    item_date: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: sequelize.literal('CURRENT_TIMESTAMP')
    },
    cost: {
      type: DataTypes.DECIMAL,
      allowNull: false
    },
    conn_info: {
      type: DataTypes.STRING(512),
      allowNull: false
    },
    min_attendees: {
      type: DataTypes.INTEGER(11),
      allowNull: true
    },
    max_attendees: {
      type: DataTypes.INTEGER(11),
      allowNull: true
    },
    confirmed: {
      type: DataTypes.INTEGER(1),
      allowNull: true
    },
    item_sesn_type: {
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
    tableName: 'sessions'
  });
};
