const schema = process.env.DB_SCHEMA;

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.createTable('task_fields', {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER
            },
            product_id: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: {
                    model: {
                        tableName: 'products',
                        schema
                    },
                    key: 'id'
                },
                onDelete: 'cascade',
                onUpdate: 'cascade'
            },
            type: {
              type: Sequelize.STRING(255),
              allowNull: false
          },
            name: {
                type: Sequelize.STRING(255),
                allowNull: false
            },
            created_at: {
                allowNull: false,
                type: Sequelize.DATE
            },
            updated_at: {
                allowNull: false,
                type: Sequelize.DATE
            }
        }, {
            schema
        });

        await queryInterface.createTable('task_fields_values', {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER
            },
            task_field_id: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: {
                    model: {
                        tableName: 'task_fields',
                        schema
                    },
                    key: 'id'
                },
                onDelete: 'cascade',
                onUpdate: 'cascade'
            },
            title: {
                type: Sequelize.TEXT,
                field: 'title'
            }
        }, {
            schema
        });

        await queryInterface.createTable('task_fields_values_properties', {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER
            },
            task_field_value_id: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: {
                    model: {
                        tableName: 'task_fields_values',
                        schema
                    },
                    key: 'id'
                },
                onDelete: 'cascade',
                onUpdate: 'cascade'
            },
            name: {
                type: Sequelize.TEXT,
                field: 'name'
            },
            value: {
                type: Sequelize.TEXT,
                field: 'value'
            }
        }, {
            schema
        });

        return queryInterface.createTable('custom_task_fields', {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER
            },
            task_id: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: {
                    model: {
                        tableName: 'tasks',
                        schema
                    },
                    key: 'id'
                },
                onDelete: 'cascade',
                onUpdate: 'cascade'
            },
            task_field_id: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: {
                    model: {
                        tableName: 'task_fields',
                        schema
                    },
                    key: 'id'
                },
                onDelete: 'cascade',
                onUpdate: 'cascade'
            },
            value: {
                type: Sequelize.TEXT,
                field: 'value'
            }
        }, {
            schema
        });

    },
    down: async (queryInterface) => {

        await queryInterface.dropTable({
            tableName: 'custom_fields',
            schema
        });

        await queryInterface.dropTable({
            tableName: 'task_fields_values_properties',
            schema
        });

        await queryInterface.dropTable({
            tableName: 'task_fields_values',
            schema
        });

        return queryInterface.dropTable({
            tableName: 'custom_task_fields',
            schema
        });
    }
};
