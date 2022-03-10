import app from '../index.js'
import chai from 'chai'
import chaiHttp from 'chai-http'

const assert = chai.assert

chai.use(chaiHttp)

describe('Test Hello World', () => {
  describe('GET /', () => {
    it('it should return hello world message', (done) => {
      chai.request(app)
        .get('/')
        .end((err, res) => {
          if (err) {
            throw err
          }
          assert.equal(res.text, '<h1>Hello World, Koa folks!</h1>', 'Incorrect hello world message')
          done()
        })
    })
  })
})

describe('Test debug page', () => {
  describe('POST /debug', () => {
    it('it should return specified POST parameters as a JSON', (done) => {
      chai.request(app)
        .post('/debug')
        .send({
          test: 'test'
        })
        .end((err, res) => {
          if (err) {
            throw err
          }
          assert.equal(res.text, '{"test":"test"}', 'Does not match payload')
          done()
        })
    })
  })
})
