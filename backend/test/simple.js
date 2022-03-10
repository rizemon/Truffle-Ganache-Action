const app = require('../index');

const chai = require('chai');
const chaiHttp = require('chai-http');
const assert = chai.assert;

chai.use(chaiHttp);

describe('Test Hello World', () => {

    describe('GET /', () => {
        it('it should return hello world message', (done) => {
            chai.request(app)
                .get('/')
                .end((err, res) => {
                    assert.equal(res.text, '<h1>Hello World, Koa folks!</h1>', 'Incorrect hello world message');
                done();
                });
        });
    });

});


describe('Test debug page', () => {

    describe('POST /debug', () => {
        it('it should return specified POST parameters as a JSON', (done) => {
        chai.request(app)
            .post('/debug')
            .send({
                'test': 'test'
            })
            .end((err, res) => {
                assert.equal(res.text, '{"test":"test"}', 'Does not match payload');
                done();
            });
        });
    });
  
});