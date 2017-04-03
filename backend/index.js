const Koa = require('koa');
const app = new Koa();

process.on('unhandledRejection', (err) => {
  console.error(err);
});

app.use(ctx => {
  ctx.body = 'Hello World';
});

const port = process.env.PORT || 3001;
app.listen(port, (err => {
  if (err) throw new Error(err);
  console.info(`App started on port ${port}`)
}));
