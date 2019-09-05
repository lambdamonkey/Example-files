/*eslint new-cap: off */

const express = require('express');
const router = express.Router();
const asyncHandler = require('express-async-handler');
const entities = require('../modules/common/constants.module').entities;
const Access = require('../modules/access/access.module');
const usersRoles = require('../modules/users-roles/users-roles.module');
const Validation = require('../modules/access/validation.module');
const { TaskFields } = require('../models');
const { TaskFieldsValues } = require('../models');
const { TaskFieldsValuesProperties } = require('../models');
const { Response } = require('../modules/common/response.module');


const url = '/:accountId/products/:productId/fields';

/**
 * @swagger
 * /api/v1/account/{accountId}/products/{productId}/fields:
 *  post:
 *      tags:
 *          - Custom Task Fields
 *      description: Creates new custom task field
 *      produces:
 *          - application/json
 *
 *      parameters:
 *        - in: query
 *          name: token
 *          type: string
 *          required: true
 *          description: User's token
 *        - in: path
 *          name: accountId
 *          type: number
 *          required: true
 *        - in: body
 *          name: body
 *          type: Task field data
 *          required: true
 *
 *      responses:
 *          200:
 *              description: Success
 *          401:
 *              description: Unauthorized
 *          403:
 *              description: Forbidden
 *              schema:
 *                  $ref: "#/definitions/TError"
 *
 *          422:
 *              description: Unprocessable Entity (Wrong request parameters)
 *              schema:
 *                  $ref: "#/definitions/TError"
 */

router.post(url, usersRoles.getUserRole({
    entity: entities.products
}), Access.check({
    entity: entities.products,
    action: 'create'
}), Validation.endpoints.taskFields.create, Validation.check, asyncHandler(async (req, res) => {

    const body = req.body;
    const params = req.params;

    body.productId = params.productId;

    const taskField = await TaskFields.create(body, {
        include: [{
            model: TaskFieldsValues,
            as: 'values',
            include: [{
                model: TaskFieldsValuesProperties,
                as: 'properties'
            }]
        }],
        raw: true
    });

    const response = await TaskFields.findOne({
        where: {
            id: taskField.id
        },
        include: [{
            model: TaskFieldsValues,
            as: 'values',
            include: [{
                model: TaskFieldsValuesProperties,
                as: 'properties'
            }]
        }]
    });

    res.send(Response.success(response));

}));


/**
 * @swagger
 * /api/v1/account/{accountId}/products/{productId}/fields/{id}:
 *  get:
 *      tags:
 *          - Custom Task Fields
 *      description: Retrieve task field by id
 *      produces:
 *          - application/json
 *
 *      parameters:
 *        - in: query
 *          name: token
 *          type: string
 *          required: true
 *          description: User's token
 *        - in: path
 *          name: accountId
 *          type: number
 *          required: true
 *        - in: body
 *          name: body
 *          type: Task field data
 *          required: true
 *
 *      responses:
 *          200:
 *              description: Success
 *          401:
 *              description: Unauthorized
 *          403:
 *              description: Forbidden
 *              schema:
 *                  $ref: "#/definitions/TError"
 *
 *          422:
 *              description: Unprocessable Entity (Wrong request parameters)
 *              schema:
 *                  $ref: "#/definitions/TError"
 */

router.get(`${url}/:id`, usersRoles.getUserRole({
    entity: entities.products
}), Access.check({
    entity: entities.products,
    action: 'read'
}), asyncHandler(async (req, res) => {

    const where = {
        id: req.params.id
    };

    const taskField = await TaskFields.findOne({
        where,
        include: [{
            model: TaskFieldsValues,
            as: 'values',
            include: [{
                model: TaskFieldsValuesProperties,
                as: 'properties'
            }]
        }]
    });

    return res.send(Response.success(taskField));

}));

/**
 * @swagger
 * /api/v1/account/{accountId}/products/{productId}/fields/{id}:
 *  put:
 *      tags:
 *          - Custom Task Fields
 *      description: Updates task field by id
 *      produces:
 *          - application/json
 *
 *      parameters:
 *        - in: query
 *          name: token
 *          type: string
 *          required: true
 *          description: User's token
 *        - in: path
 *          name: accountId
 *          type: number
 *          required: true
 *        - in: body
 *          name: body
 *          type: Task field data
 *          required: true
 *
 *      responses:
 *          200:
 *              description: Success
 *          401:
 *              description: Unauthorized
 *          403:
 *              description: Forbidden
 *              schema:
 *                  $ref: "#/definitions/TError"
 *
 *          422:
 *              description: Unprocessable Entity (Wrong request parameters)
 *              schema:
 *                  $ref: "#/definitions/TError"
 */

router.put(`${url}/:id`, usersRoles.getUserRole({
    entity: entities.products
}), Access.check({
    entity: entities.products,
    action: 'update'
}), Validation.endpoints.taskFields.update, Validation.check, asyncHandler(async (req, res) => {

    const {
        body, params
    } = req;

    const {
        id, productId
    } = params;

    const where = {
        id,
        productId
    };

    //Helpers.queryCondition(where, user.id, account.id, entities.roadMaps, user.roles);

    const taskField = await TaskFields.findOne({
        where,
        include: [{
            model: TaskFieldsValues,
            as: 'values',
            include: [{
                model: TaskFieldsValuesProperties,
                as: 'properties'
            }]
        }]
    });


    if (!taskField) {
        return res.send(Response.forbidden({ message: contents.errors.requests.forbidden }));
    }

    await TaskFields.update(body, {
        where
    });

    const fieldValueIds = taskField.values.map((value) => {
        return value.id;
    });

    if (body.values) {

        const toUpdate = [];
        const toAdd = [];
        const toUpdateIds = [];

        for (const value of body.values) {
            if (value.id) {
                toUpdate.push(value);
                toUpdateIds.push(value.id);
            } else {
                value.task_field_id = id;
                toAdd.push(value);
            }
        }

        const toDeleteIds = fieldValueIds.filter((valueId) => {
            return !toUpdateIds.includes(valueId);
        });

        await TaskFieldsValues.destroy({
            where: {
                id: toDeleteIds
            }
        });

        if (toAdd.length) {
            for (const value of toAdd) {
                await TaskFieldsValues.create(value, [{
                    model: TaskFieldsValuesProperties,
                    as: 'properties'
                }]);
            }
        }

        if (toUpdate.length) {
            const valuesToUpdate = await TaskFieldsValues.findAll({
                where: {
                    id: [...toUpdate.map((value) => {
                        return value.id;
                    })],
                    task_field_id: id
                },
                include: [{
                    model: TaskFieldsValuesProperties,
                    as: 'properties'
                }]
            });

            for (const value of valuesToUpdate) {
                const newValue = toUpdate.filter((valueToUpdate) => {
                    return valueToUpdate.id === value.id;
                }).pop();

                if (newValue) {
                    const propertiesToRemove = value.properties.map((property) => {
                        return property.id;
                    });

                    await TaskFieldsValuesProperties.destroy({
                        where: {
                            id: propertiesToRemove
                        }
                    });

                    await value.removeProperties();
                    await value.update(newValue);

                    if (newValue.properties) {
                        const propertiesToAdd = [];

                        for (const property of newValue.properties) {
                            property.TaskFieldsValueId = value.id;
                            propertiesToAdd.push(property);
                        }

                        await TaskFieldsValuesProperties.bulkCreate(propertiesToAdd);
                    }
                }
            }
        }
    } else if (fieldValueIds.length) {
        await TaskFields.remove({
            where: {
                id: fieldValueIds
            }
        });
    }

    const response = await TaskFields.findOne({
        where,
        include: [{
            model: TaskFieldsValues,
            as: 'values',
            include: [{
                model: TaskFieldsValuesProperties,
                as: 'properties'
            }]
        }]
    });

    return res.send(Response.success(response));
}));

/**
 * @swagger
 * /api/v1/account/{accountId}/products/{productId}/fields/{id}:
 *  delete:
 *      tags:
 *          - Custom Task Fields
 *      description: Deletes task field by id
 *      produces:
 *          - application/json
 *
 *      parameters:
 *        - in: query
 *          name: token
 *          type: string
 *          required: true
 *          description: User's token
 *        - in: path
 *          name: accountId
 *          type: number
 *          required: true
 *        - in: path
 *          name: id
 *          type: Task field id
 *          required: true
 *
 *      responses:
 *          200:
 *              description: Success
 *          401:
 *              description: Unauthorized
 *          403:
 *              description: Forbidden
 *              schema:
 *                  $ref: "#/definitions/TError"
 *
 *          422:
 *              description: Unprocessable Entity (Wrong request parameters)
 *              schema:
 *                  $ref: "#/definitions/TError"
 */
router.delete(`${url}/:id`, usersRoles.getUserRole({
    entity: entities.products
}), Access.check({
    entity: entities.products,
    action: 'delete'
}), Validation.endpoints.taskFields.delete, Validation.check, asyncHandler(async (req, res) => {

    const id = parseInt(req.params.id, 10);

    await TaskFields.destroy({
        where: {
            id
        }
    });

    return res.send(Response.success({ message: true }));
}));


module.exports = router;
