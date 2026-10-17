const mongoose = require('mongoose');

const authorSchema = new mongoose.Schema({
  name: String,
  nationality: String
}, { versionKey: false });

const Author = mongoose.model('Author', authorSchema);
module.exports = Author;