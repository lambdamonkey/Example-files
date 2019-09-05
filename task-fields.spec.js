/*eslint no-invalid-this: off */
/*eslint no-unused-expressions: off */
const supertest = require('supertest');
const _ = require('lodash');
const app = require('../app');
const api = supertest(app);
const expect = require('chai').expect;

const helpers = require('../tests/helpers');


describe('custom task fields test', function () {
    this.timeout(60 * 1000);

    let seed;
    let auth;
    let url;
    let product;
    let testField;
    let testFieldSecond;
    let testFieldThird;
    let task;

    before(async () => {
        await helpers.clear();
        seed = await helpers.tasks.seed();
        ({ account, roles, auth, company, productLine, product, url, template, release, sprint, kanban, task } = seed);
    });

    it('should create and retrieve custom task field with text type', async () => {
        testField = {
            productId: product.id,
            name: 'Test name',
            type: 'text'
        };

        return api
            .post(`${url}/products/${product.id}/fields`)
            .send(testField)
            .set('Accept', 'application/json')
            .set('x-access-token', auth.user.token)
            .expect(200)
            .expect('Content-Type', /json/)
            .then((response) => {
                return response.body.data;
            })
            .then((response) => {
                expect(response).to.have.property('name');
                expect(response).to.have.property('type');
                expect(response.name).to.equal(testField.name);
                expect(response.type).to.equal(testField.type);
                testField = response;
            });
    });

    it('should create and retrieve custom task field with list type and text value', async () => {
        testFieldSecond = {
            productId: product.id,
            name: 'Test List Field',
            type: 'list',
            values: [
                {
                    title: "Low"
                },
                {
                    title: "Medium"
                },
                {
                    title: "High"
                },
                {
                    title: "Highest"
                }
            ]
        };

        return api
            .post(`${url}/products/${product.id}/fields`)
            .send(testFieldSecond)
            .set('Accept', 'application/json')
            .set('x-access-token', auth.user.token)
            .expect(200)
            .expect('Content-Type', /json/)
            .then((response) => {
                return response.body.data;
            })
            .then((response) => {
                expect(response).to.have.property('name');
                expect(response).to.have.property('type');
                expect(response.name).to.equal(testFieldSecond.name);
                expect(response.type).to.equal(testFieldSecond.type);
            });
    });

    it('should create custom task field with list type and text value', async () => {
        testFieldThird = {
            productId: product.id,
            name: "Test dropdown field",
            type: "List",
            values: [
                {
                    title: "Field one",
                    properties: [
                        {
                            name: "color",
                            value: "red"
                        }
                    ]
                }
            ]
        };

        return api
            .post(`${url}/products/${product.id}/fields`)
            .send(testFieldThird)
            .set('Accept', 'application/json')
            .set('x-access-token', auth.user.token)
            .expect(200)
            .expect('Content-Type', /json/)
            .then((response) => {
                return response.body.data;
            })
            .then((response) => {
                expect(response).to.have.property('name');
                expect(response).to.have.property('type');
                expect(response.name).to.equal(testFieldThird.name);
                expect(response.type).to.equal(testFieldThird.type);
                expect(response.values[0].title).to.equal(testFieldThird.values[0].title);
                expect(response.values[0].properties[0].name).to.equal(testFieldThird.values[0].properties[0].name);
                testFieldThird = response;
            });
    });

    it('should retrieve custom task field with list type and text value by id', async () => {

        return api
            .get(`${url}/products/${product.id}/fields/${testFieldThird.id}`)
            .set('Accept', 'application/json')
            .set('x-access-token', auth.user.token)
            .expect(200)
            .expect('Content-Type', /json/)
            .then((response) => {
                return response.body.data;
            })
            .then((response) => {
                expect(response).to.have.property('name');
                expect(response).to.have.property('type');
                expect(response.name).to.equal(testFieldThird.name);
                expect(response.type).to.equal(testFieldThird.type);
                expect(response.values[0].title).to.equal(testFieldThird.values[0].title);
                expect(response.values[0].properties[0].name).to.equal(testFieldThird.values[0].properties[0].name);
            });
    });

    it('should update test field text type', async () => {

        return api
            .put(`${url}/products/${product.id}/fields/${testFieldThird.id}`)
            .send(testFieldThird)
            .set('Accept', 'application/json')
            .set('x-access-token', auth.user.token)
            .expect(200)
            .then((response) => {
                return response.body.data;
            })
            .then((response) => {
                expect(response.name).to.equal(testFieldThird.name);
            });
    });

    it('should add another field value', async () => {

        const field = {
            values: [
                {
                    title: 'New value',
                    properties: [
                        {
                            name: 'new-value-name',
                            value: 'test'
                        }
                    ]
                },
                ...testFieldThird.values
            ]
        };

        return api
            .put(`${url}/products/${product.id}/fields/${testFieldThird.id}`)
            .send(field)
            .set('Accept', 'application/json')
            .set('x-access-token', auth.user.token)
            .expect(200)
            .then((response) => {
                return response.body.data;
            })
            .then((response) => {
                const newValue = response.values.filter(value => value.title === field.values[0].title);

                expect(newValue.length > 0).to.eq(true);
            });
    });

    it('should delete field value if it doesn\'t exists in update request', async () => {

        testFieldThird.values.pop();

        const field = {
            values: [
                ...testFieldThird.values
            ]
        };

        return api
            .put(`${url}/products/${product.id}/fields/${testFieldThird.id}`)
            .send(field)
            .set('Accept', 'application/json')
            .set('x-access-token', auth.user.token)
            .expect(200)
            .then((response) => {
                return response.body.data;
            })
            .then((response) => {
                expect(response.values).to.have.length(testFieldThird.values.length);
            });
    });

    it('should includes custom fields for list of products', async () => {

        return api
            .get(`/api/v1/account/${account.id}/products`)
            .set('Accept', 'application/json')
            .set('x-access-token', auth.user.token)
            .expect(200)
            .then((response) => {
                return response.body.data;
            })
            .then((response) => {
                expect(response[0]).to.have.property('fields');
                expect(response[0].fields).to.be.an('array');
            });
    });


    it('should includes custom fields for given product', async () => {

        return api
            .get(`/api/v1/account/${account.id}/products/${product.id}`)
            .set('Accept', 'application/json')
            .set('x-access-token', auth.user.token)
            .expect(200)
            .then((response) => {
                return response.body.data;
            })
            .then((response) => {
                expect(response).to.have.property('fields');
                expect(response.fields).to.be.an('array');
                expect(response.fields[0]).to.have.property('name');
                expect(response.fields[0]).to.have.property('type');
                expect(response.fields[0]).to.have.property('values');
            });
    });

    it('should create task with custom task fields', async () => {
        task = _.clone(helpers.tasks.task2);

        task.productId = product.id;
        task.statusId = product.statuses[0].id;
        task.reporterId = auth.user.id;
        task.assigneeId = product.managerId;
        task.accountId = account.id;
        task.companyId = company.id;
        task.productLineId = productLine.id;
        task.sprintId = sprint.id;
        task.releaseId = release.id;
        task.point = 2;

        task.fields = [{
            taskFieldId: testFieldThird.id,
            value: 'test value'
        }];

        return api
            .post(`${url}/tasks`)
            .send(task)
            .set('Accept', 'application/json')
            .set('x-access-token', auth.user.token)
            .expect(200)
            .then(response => response.body.data)
            .then(response => {
                task = response;
                expect(response).to.have.property('fields');
                expect(response.fields).to.be.an('array');
                expect(response.fields[0].value).to.eq('test value');
            });
    });

    it('should include custom task fields for each task', async () => {
        return api
            .get(`/api/v1/account/${account.id}/tasks`)
            .set('Accept', 'application/json')
            .set('x-access-token', auth.user.token)
            .expect(200)
            .then((response) => {
                return response.body.data;
            })
            .then((response) => {
                expect(response[0]).to.have.property('fields');
                expect(response[0].fields).to.be.an('array');
            });

    });

    it('should update custom task fields', async () => {

        delete task.resolvedDate;

        const newTaskField = {
            taskFieldId: testFieldThird.id,
            value: 'new test value'
        };

        task.fields[0].value = 'updated value';
        task.fields.push(newTaskField);

        return api
            .put(`/api/v1/account/${account.id}/tasks/${task.id}`)
            .send(task)
            .set('Accept', 'application/json')
            .set('x-access-token', auth.user.token)
            .expect(200)
            .then((response) => {
                return response.body.data;
            })
            .then((response) => {

                expect(response).to.have.property('fields');
                expect(response.fields).to.be.an('array');
                expect(response.fields).to.have.length(2);
                const values = response.fields.map(field => {
                    return field.value;
                });

                expect(_.some(values, (value) => {
                    return value === 'new test value';
                })).to.be.true;
                expect(_.some(values, (value) => {
                    return value === 'updated value';
                })).to.be.true;
            });
    });

    it('should remove custom task fields from task', async () => {

        delete task.resolvedDate;
        task.fields = [];

        return api
            .put(`/api/v1/account/${account.id}/tasks/${task.id}`)
            .send(task)
            .set('Accept', 'application/json')
            .set('x-access-token', auth.user.token)
            .expect(200)
            .then((response) => {
                return response.body.data;
            })
            .then((response) => {
                expect(response).to.have.property('fields');
                expect(response.fields).to.be.an('array');
                expect(response.fields).to.have.length(0);
            });
    });

    it('should delete all field values if we send empty array', () => {

        const field = {
            values: []
        };

        return api
            .put(`${url}/products/${product.id}/fields/${testFieldThird.id}`)
            .send(field)
            .set('Accept', 'application/json')
            .set('x-access-token', auth.user.token)
            .expect(200)
            .then((response) => {
                return response.body.data;
            })
            .then((response) => {
                expect(response.values).to.have.length(0);
            });
    });

    it('should delete custom task field by id', async () => {

        return api
            .delete(`${url}/products/${product.id}/fields/${testFieldThird.id}`)
            .set('Accept', 'application/json')
            .set('x-access-token', auth.user.token)
            .expect(200)
            .then((response) => {
                return response.body.data;
            })
            .then(() => {
                return api
                    .get(`${url}/${testFieldThird.id}`)
                    .set('Accept', 'application/json')
                    .set('x-access-token', auth.user.token)
                    .expect(404);
            });
    });
});
