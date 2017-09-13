const jwt = require('jsonwebtoken');
const { SECRET } = require('../config');

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
    allLinks: async (root, data, { mongo: { Links } }) => {
      return await Links.find();
    },
  },
  Mutation: {
    createLink: async (root, data, { mongo: { Links }, user }) => {
      if (!user) throw new Error('Unauthorized');
      const newLink = Object.assign({ postedById: user._id }, data);
      return await Links.create(newLink);
    },
    createUser: async (root, data, { mongo: { Users } }) => {
      return await Users.create(data);
    },
    createVote: async (root, data, { mongo: { Votes }, user }) => {
      if (!user) throw new Error('Unauthorized');
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
};
