const { makeExecutableSchema } = require('graphql-tools');
const resolvers = require('./resolovers')

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

module.exports = makeExecutableSchema({ typeDefs, resolvers });
