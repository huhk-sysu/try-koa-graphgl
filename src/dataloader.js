const DataLoader = require('dataloader');

async function batch(Model, keys) {
  return result = await Model.find({ _id: { $in: keys } });
}

const cacheKeyFn = key => key.toString();

module.exports = ({ Users, Links, Votes }) => ({
  userLoader: new DataLoader(keys => batch(Users, keys), { cacheKeyFn }),
  linkLoader: new DataLoader(keys => batch(Links, keys), { cacheKeyFn }),
  voteLoader: new DataLoader(keys => batch(Votes, keys), { cacheKeyFn }),
});
