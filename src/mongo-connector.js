const mongoose = require('mongoose');
const Logger = mongoose.mongo.Logger;
const Schema = mongoose.Schema;
const MONGO_URL = 'mongodb://localhost:27017/hackernews';

const linkSchema = new Schema({
  url: String,
  description: String,
  postedById: Schema.Types.ObjectId,
});

const userSchema = new Schema({
  name: String,
  password: String,
});

const VoteSchema = new Schema({
  userId: Schema.Types.ObjectId,
  linkId: Schema.Types.ObjectId,
});

mongoose.Promise = global.Promise;
mongoose.connect(MONGO_URL, { useMongoClient: true });

let logCount = 0;
Logger.setCurrentLogger((msg, state) => {
  console.log(`MONGO DB REQUEST No. ${++logCount}`);
});
Logger.setLevel('debug');
Logger.filter('class', ['Cursor']);

module.exports = {
  Links: mongoose.model('Links', linkSchema),
  Users: mongoose.model('Users', userSchema),
  Votes: mongoose.model('Votes', VoteSchema),
};
