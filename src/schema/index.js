const { makeExecutableSchema } = require('graphql-tools');
const resolvers = require('./resolovers');

const typeDefs = `
  type Link {
    id: ID!
    url: String!
    description: String!
    postedBy: User!
  }

  type User {
    id: ID!
    name: String!
    password: String!
  }

  type SigninPayload {
    token: String
    user: User
  }

  type Query {
    allLinks: [Link!]!
  }

  type Mutation {
    createLink(url: String!, description: String!): Link
    createUser(name: String!, password: String!): User
    signinUser(name: String!, password: String!): SigninPayload!
  }
`;

module.exports = makeExecutableSchema({ typeDefs, resolvers });
