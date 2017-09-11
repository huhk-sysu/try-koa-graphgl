const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const MONGO_URL = 'mongodb://localhost:27017/hackernews';

const linkSchema = new Schema({
  url: String,
  description: String,
});

mongoose.Promise = global.Promise;
mongoose.connect(MONGO_URL, { useMongoClient: true });

module.exports = mongoose.model('Links', linkSchema);
