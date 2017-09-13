const koa = require('koa');
const koaRouter = require('koa-router');
const koaBody = require('koa-bodyparser');
const { graphqlKoa, graphiqlKoa } = require('apollo-server-koa');
const { authenticate } = require('./authentication');
const schema = require('./schema');
const mongo = require('./mongo-connector');
const buildDataloaders = require('./dataloader');
const formatError = require('./formatError');

const app = new koa();
const router = new koaRouter();
const PORT = 3000;

const buildOptions = async ctx => {
  const user = await authenticate(ctx, buildDataloaders(mongo));
  return {
    context: { mongo, user, dataloaders: buildDataloaders(mongo) },
    schema,
    formatError,
    debug: false,
  };
};

router.post('/graphql', koaBody(), graphqlKoa(buildOptions));

router.get(
  '/graphiql',
  graphiqlKoa({
    endpointURL: '/graphql',
    // passHeader: `'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjU5YjdiYjkwZDNlMDA5ZTI1OWFiNmI4NCIsImlhdCI6MTUwNTIxMzQzOH0.TxBaDwriYDkiD9vskLiVYJWHlkE6frg-11Qtvval6XE'`,
    passHeader: `'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjU5YjdjZjM2OTc5MDczNjVmOGQ5NWQ3NiIsImlhdCI6MTUwNTIxODYxMn0.PAemsJ9RqiKwp-wJVLLr48VFNJkUuwh6v9HeD9zup6U'`,
  })
);

app.use(router.routes());
app.use(router.allowedMethods());
app.listen(PORT, () => {
  console.log(
    `Server is running. Test server on http://localhost:${PORT}/graphiql .`
  );
});
