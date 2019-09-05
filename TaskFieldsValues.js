const { DataTypes, Model } = require('sequelize');

class TaskFieldsValues extends Model {
    static init(sequelize) {
        return super.init(
            {
                task_field_id: {
                    type: DataTypes.INTEGER,
                    field: 'task_field_id'
                },
                title: {
                    type: DataTypes.TEXT,
                    field: 'title'
                }
            },
            {
                sequelize,
                tableName: 'task_fields_values',
                underscored: true,
                timestamps: false
            }
        );
    }

    static associate(models) {
        TaskFieldsValues.hasMany(models.TaskFieldsValuesProperties, {
            as: 'properties',
            foreignKey: 'task_field_value_id'
        });
    }
}

module.exports = TaskFieldsValues;
