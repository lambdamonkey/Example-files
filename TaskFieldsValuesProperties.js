const { DataTypes, Model } = require('sequelize');

class TaskFieldsValuesProperties extends Model {
    static init(sequelize) {
        return super.init(
            {
                task_field_value_id: {
                    type: DataTypes.INTEGER,
                    field: 'task_field_value_id'
                },
                name: {
                    type: DataTypes.TEXT,
                    field: 'name'
                },
                value: {
                    type: DataTypes.TEXT,
                    field: 'value'
                }
            },
            {
                sequelize,
                tableName: 'task_fields_values_properties',
                underscored: true,
                timestamps: false
            }
        );
    }
}

module.exports = TaskFieldsValuesProperties;
