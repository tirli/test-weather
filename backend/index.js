const Koa = require('koa');
const router = require('koa-route');
const createApi = require('./api');

const app = new Koa();

process.on('unhandledRejection', (err) => {
  console.error(err);
});

app.use(async (ctx, next) => {
  try {
    await next();
  } catch (e) {
    ctx.status = e.status || 500;
    ctx.type = 'application/json';
    ctx.body = e.message;
  }
});

createApi().then((api) => {
  app.use(router.get('/api/cities', api.cities));
  app.use(router.get('/api/forecast', api.forecast));
});

const port = process.env.PORT || 3001;
app.listen(port, ((err) => {
  if (err) throw new Error(err);
  console.info(`App started on port ${port}`);
}));
