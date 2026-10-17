const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required and cannot be empty'],
    trim: true
  },
  author: String,
  year: Number,
  genres: [String]
}, { versionKey: false });

bookSchema.index({ title: 1 });

const Book = mongoose.model('Book', bookSchema);
module.exports = Book;