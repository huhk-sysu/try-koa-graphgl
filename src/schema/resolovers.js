const jwt = require('jsonwebtoken');
const { URL } = require('url');
const { SECRET } = require('../config');
const { PubSub } = require('graphql-subscriptions');
const pubsub = new PubSub();

class ValidationError extends Error {
  constructor(message, field) {
    super(message);
    this.field = field;
  }
}

class authenticationError extends Error {
  constructor(message, hint) {
    super(message);
    this.hint = hint;
  }
}

function assertValidLink({ url }) {
  try {
    new URL(url);
  } catch (error) {
    throw new ValidationError('Link validation error: invalid url.', 'url');
  }
}

module.exports = {
  Link: {
    postedBy: async ({ postedById }, data, { dataloaders: { userLoader } }) => {
      return await userLoader.load(postedById);
    },
    votes: async ({ _id }, data, { mongo: { Votes } }) => {
      return await Votes.find({ linkId: _id });
    },
  },
  User: {
    votes: async ({ _id }, data, { mongo: { Votes } }) => {
      return await Votes.find({ userId: _id });
    },
  },
  Vote: {
    user: async ({ userId }, data, { dataloaders: { userLoader } }) => {
      return await userLoader.load(userId);
    },
    link: async ({ linkId }, data, { dataloaders: { linkLoader } }) => {
      return await linkLoader.load(linkId);
    },
  },
  Query: {
    allLinks: async (root, { filter }, { mongo: { Links } }) => {
      let query = {};
      if (filter) {
        let { url_contains, description_contains } = filter;
        if (url_contains) {
          query.url = { $regex: new RegExp(`${url_contains}`), $options: 'i' };
        }
        if (description_contains) {
          query.description = {
            $regex: new RegExp(`${description_contains}`),
            $options: 'i',
          };
        }
      }
      return await Links.find(query);
    },
  },
  Mutation: {
    createLink: async (root, data, { mongo: { Links }, user }) => {
      if (!user) {
        throw new authenticationError(
          'User authentication error: please bear your token in header.',
          'You will get the token after login.'
        );
      }
      assertValidLink(data);
      const newLink = Object.assign({ postedById: user._id }, data);
      const response = await Links.create(newLink);
      pubsub.publish('LinkCreated', { LinkCreated: response });
      return response;
    },
    createUser: async (root, data, { mongo: { Users } }) => {
      return await Users.create(data);
    },
    createVote: async (root, data, { mongo: { Votes }, user }) => {
      if (!user) {
        throw new authenticationError(
          'User authentication error: please bear your token in header.',
          'You will get the token after login.'
        );
      }
      const newVote = Object.assign({ userId: user._id }, data);
      return await Votes.create(newVote);
    },
    signinUser: async (root, data, { mongo: { Users } }) => {
      const user = await Users.findOne({ name: data.name });
      if (data.password === user.password) {
        return {
          token: jwt.sign({ id: user.id }, SECRET),
          user,
        };
      }
    },
  },
  Subscription: {
    LinkCreated: {
      subscribe: () => pubsub.asyncIterator('LinkCreated'),
    },
  },
};
