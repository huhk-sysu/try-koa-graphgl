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
  },
};
