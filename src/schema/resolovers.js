const jwt = require('jsonwebtoken');
const { SECRET } = require('../config');

module.exports = {
  Link: {
    postedBy: async ({ postedById }, data, { mongo: { Users } }) => {
      return await Users.findOne({ _id: postedById });
    },
  },
  Query: {
    allLinks: async (root, data, { mongo: { Links } }) => {
      return await Links.find();
    },
  },
  Mutation: {
    createLink: async (root, data, { mongo: { Links }, user }) => {
      if (!user)
        throw new Error('Unauthorized');
      const newLink = Object.assign({ postedById: user._id }, data);
      return await Links.create(newLink);
    },
    createUser: async (root, data, { mongo: { Users } }) => {
      return await Users.create(data);
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
