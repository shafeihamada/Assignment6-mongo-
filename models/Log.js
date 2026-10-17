const mongoose = require('mongoose');

const logSchema = new mongoose.Schema({
  book_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Book'
  },
  action: String
}, { 
  capped: { size: 1048576 },
  versionKey: false 
});

const Log = mongoose.model('Log', logSchema, 'logs');
module.exports = Log;