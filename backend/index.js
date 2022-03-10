import Koa from 'koa'
import bodyParser from 'koa-body'
import Router from '@koa/router'
import mongoose from 'mongoose'

const app = new Koa()
const router = new Router()

mongoose.connect('mongodb://root:root@127.0.0.1:27017/test')
  .catch(function () {
    throw new Error('Fail to connect to mongodb')
  })

router.get('index', '/', async (ctx, next) => {
  ctx.body = '<h1>Hello World, Koa folks!</h1>'
})

router.post('debug', '/debug', bodyParser(), async (ctx, next) => {
  ctx.body = JSON.stringify(ctx.request.body)
})

app
  .use(router.routes())
  .use(router.allowedMethods())

const PORT = process.env.PORT || 3000

export default app.listen(PORT, () => console.log(`Running on port ${PORT}`))
