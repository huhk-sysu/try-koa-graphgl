const mongoose = require('mongoose');
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

module.exports = {
  Links: mongoose.model('Links', linkSchema),
  Users: mongoose.model('Users', userSchema),
  Votes: mongoose.model('Votes', VoteSchema),
};
