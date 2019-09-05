const { DataTypes, Model } = require('sequelize');

class TaskFields extends Model {
    static init(sequelize) {
        return super.init(
            {
                productId: {
                    type: DataTypes.INTEGER,
                    field: 'product_id'
                },
                name: {
                    type: DataTypes.TEXT,
                    field: 'name'
                },
                type: {
                    type: DataTypes.TEXT
                }
            },
            {
                sequelize,
                tableName: 'task_fields',
                underscored: true
            }
        );
    }

    static associate(models) {
        TaskFields.hasMany(models.TaskFieldsValues, {
            as: 'values',
            foreignKey: 'task_field_id'
        });
    }
}

module.exports = TaskFields;
