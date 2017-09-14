const { makeExecutableSchema } = require('graphql-tools');
const resolvers = require('./resolovers');

const typeDefs = `
  type Link {
    id: ID!
    url: String!
    description: String!
    postedBy: User!
    votes: [Vote!]!
  }

  type User {
    id: ID!
    name: String!
    password: String!
    votes: [Vote!]!
  }

  type Vote {
    id: ID!
    user: User!
    link: Link!
  }

  type SigninPayload {
    token: String
    user: User
  }

  input LinkFilter {
    description_contains: String
    url_contains: String
  }

  type Query {
    allLinks(filter: LinkFilter): [Link!]!
  }

  type Mutation {
    createLink(url: String!, description: String!): Link
    createUser(name: String!, password: String!): User
    createVote(linkId: ID!): Vote
    signinUser(name: String!, password: String!): SigninPayload!
  }

  type Subscription {
    LinkCreated: Link!
  }
`;

module.exports = makeExecutableSchema({ typeDefs, resolvers });
// 