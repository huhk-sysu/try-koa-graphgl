# 编写简单的GraphQL服务器

[教程来源](https://www.howtographql.com)

[官方文档](http://graphql.org/learn/)

## 0. 准备工作

- 安装相关依赖

```bash
yarn add koa koa-bodyparser koa-router apollo-server-koa graphql-tools graphql mongoose
```

## 1. 查询

- 在`src/schema/index.js`中编写类型定义，注意要用字符串形式。

```javascript
const typeDefs = `
  type Link {
    id: ID!
    url: String!
    description: String!
  }

  type Query {
    allLinks: [Link!]!
  }
`;
```

类型定义中，我们定义了一个有3个属性的类型`Link`，同时定义了`allLinks`，这个查询会返回一个含有若干`Link`的数组。

- 在`src/schema/resolovers.js`中编写求解方法。在与数据库打交道之前，暂时先以硬编码的方式把数据内容写在此处。

```javascript
const links = [
  {
    id: 1,
    url: 'http://graphql.org/',
    description: 'The Best Query Language'
  },
  {
    id: 2,
    url: 'http://dev.apollodata.com',
    description: 'Awesome GraphQL Client'
  },
];

module.exports = {
  Query: {
    allLinks: () => links,
  },
};
```

求解方法告诉`GraphQL`如何对`allLinks`这个查询作出回应，这里是直接返回定义好的内容。其中的`allLinks`名称应当与之前的类型定义里的对应。

- 在`src/schema/index.js`中使用`graphql-tools`提供的工具，结合刚才的类型定义和求解方法生成schema并导出。

```javascript
const {makeExecutableSchema} = require('graphql-tools');
const resolvers = require('./resolvers');

// ...

module.exports = makeExecutableSchema({typeDefs, resolvers});
```

- 在`src/index.js`中编写、应用路由和中间件。

```javascript
const koa = require('koa');
const koaRouter = require('koa-router');
const koaBody = require('koa-bodyparser');
const { graphqlKoa, graphiqlKoa } = require('apollo-server-koa');

const schema = require('./schema');

const app = new koa();
const router = new koaRouter();
const PORT = 3000;

router.post('/graphql', koaBody(), graphqlKoa({ schema }));
router.get('/graphql', graphqlKoa({ schema }));
router.get('/graphiql', graphiqlKoa({ endpointURL: '/graphql' }));

app.use(router.routes());
app.use(router.allowedMethods());
app.listen(PORT, () => {
  console.log(`Server is running. Test server on http://localhost:${PORT}/graphiql .`);
});
```

`GraphiQL`是一个浏览器内部的有图形化界面的交互式IDE，可以让我们方便地测试服务器的功能。

- 测试服务器

启动服务器。

```bash
node ./src/index.js
```

访问 http://localhost:3000/graphiql 。

![](imgs/2017-09-11-12-23-32.png)