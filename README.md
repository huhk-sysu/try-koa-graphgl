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

## 2. 变更

- 在`src/schema/index.js`中添加类型定义。

```
  type Mutation {
    createLink(url: String!, description: String!): Link
  }
```

这里定义了一个名为`createLink`的变更，它接收2个字符串作为参数，同时返回一个`Link`类型的对象。

- 在`src/schema/resolovers.js`中添加求解方式。

```javascript
  Mutation: {
    createLink: (_, data) => {
      const newLink = Object.assign({ id: links.length + 1 }, data);
      links.push(newLink);
      return newLink;
    },
  },
```

这里创建一个新对象并添加到`links`数组里。`data`参数是一个对象，包含了用于查询的参数（在本例中有`url`和`description`）。

- 测试服务器

![](imgs/2017-09-11-12-57-56.png)

![](imgs/2017-09-11-12-59-53.png)

## 3. 连接数据库

- 开启mongoDB服务器。

- 在`src/mongo-connector.js`中定义`Link`的模型并导出，同时进行连接mongoDB服务器的操作。

```javascript
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const MONGO_URL = 'mongodb://localhost:27017/hackernews' 

const linkSchema = new Schema({
  url: String,
  description: String
})

mongoose.Promise = global.Promise;
mongoose.connect(MONGO_URL, { useMongoClient: true });

module.exports = mongoose.model('Links', linkSchema)
```

- 在`src/index.js`里获取上面文件导出的内容，并包装在`context`里。这样在求解方法的第三个参数中可以获取它，从而进行数据库操作。

```javascript
const Links = require('./mongo-connector');
router.post(
  '/graphql',
  koaBody(),
  graphqlKoa({
    context: { Links },
    schema,
  })
);
router.get(
  '/graphql',
  graphqlKoa({
    context: { Links },
    schema,
  })
);
```

- 把`src/schema/resolovers.js`里原来硬编码的内容删掉，因为已经使用数据库了。同时修改其内容，使用数据库的操作方式。

```javascript
module.exports = {
  Query: {
    allLinks: async (root, data, { Links }) => {
      return await Links.find();
    },
  },
  Mutation: {
    createLink: async (root, data, { Links }) => {
      return await Links.create(data);
    },
  }
};
```

值得一提的是，`mongoose`里面会自动给你添加一个`_id`属性，而不是`id`。但同时它也提供一个`id`的`setter`，使得你直接访问`id`即可获得`_id`的内容。因此这里不再需要编写`Links.id`的求解方法。

另外，这里直接假定数据库操作成功，而暂时没有处理异步出错的情况，仅作为演示使用。

- 测试服务器

![](imgs/2017-09-11-14-18-04.png)

![](imgs/2017-09-11-14-18-51.png)

查看数据库内部：

![](imgs/2017-09-11-14-19-58.png)