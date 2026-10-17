const express = require('express');
const mongoose = require('mongoose');
const Book = require('./models/Book');
const Author = require('./models/Author');
const Log = require('./models/Log');

const app = express();
app.use(express.json());


mongoose.connect('mongodb://localhost:27017/assignmentmongo')
  .then(() => console.log('Connected to MongoDB...'))
  .catch(err => console.error('Could not connect to MongoDB...', err));


app.post('/collection/books', async (req, res) => {
  try {
    res.status(201).json({ ok: 1 });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});


app.post('/collection/authors', async (req, res) => {
  try {
    const author = new Author(req.body);
    const result = await author.save();
    res.status(201).json({ acknowledged: true, insertedId: result._id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


app.post('/collection/logs/capped', async (req, res) => {
  try {
    res.status(201).json({ ok: 1 });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


app.post('/collection/books/index', async (req, res) => {
  try {
    await Book.syncIndexes();
    res.status(200).json({ message: "index created successfully", index: "title_1" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


app.post('/books', async (req, res) => {
  try {
    const book = new Book(req.body);
    const result = await book.save();
    res.status(201).json({ acknowledged: true, insertedId: result._id });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});


app.post('/books/batch', async (req, res) => {
  try {
    const result = await Book.insertMany(req.body);
    const insertedIds = {};
    result.forEach((doc, index) => { insertedIds[index] = doc._id; });
    res.status(201).json({ acknowledged: true, insertedIds });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});


app.post('/logs', async (req, res) => {
  try {
    const log = new Log(req.body);
    const result = await log.save();
    res.status(201).json({ acknowledged: true, insertedId: result._id });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});


app.patch('/books/future', async (req, res) => {
    try {
        const result = await mongoose.connection.db.collection("books").updateOne(
            { title: "Future" }, 
            { $set: { year: 2022 } } 
        );
        
        res.status(200).json({
            acknowledged: true,
            matchedCount: result.matchedCount,
            modifiedCount: result.modifiedCount
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


app.get('/books/title', async (req, res) => {
  try {
    const book = await Book.findOne({ title: req.query.title });
    res.status(200).json(book);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


app.get('/books/year', async (req, res) => {
  try {
    const fromYear = parseInt(req.query.from);
    const toYear = parseInt(req.query.to);
    const books = await Book.find({ year: { $gte: fromYear, $lte: toYear } });
    res.status(200).json(books);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


app.get('/books/genre', async (req, res) => {
  try {
    const books = await Book.find({ genres: req.query.genre });
    res.status(200).json(books);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});



app.get('/books/search/advanced', async (req, res) => {
    try {
        
        const books = await mongoose.connection.db.collection("books")
            .find({})
            .sort({ year: -1 }) 
            .skip(2)            
            .limit(2)           
            .toArray();
            
        res.status(200).json(books);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});



app.get('/books/type/check', async (req, res) => {
    try {
        
        const books = await mongoose.connection.db.collection("books").find({
            year: { $type: "number" }
        }).toArray();
        
        res.status(200).json(books);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});



app.get('/books/exclude-genres', async (req, res) => {
    try {
       
        const books = await mongoose.connection.db.collection("books").find({
            genres: { $nin: ["Horror", "Science Fiction"] }
        }).toArray();
        
        res.status(200).json(books);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});



app.delete('/books/before-year', async (req, res) => {
    try {
        
        const targetYear = parseInt(req.query.year) || 2000;
        
        
        const result = await mongoose.connection.db.collection("books").deleteMany({
            year: { $lt: targetYear }
        });
        
        
        res.status(200).json({
            acknowledged: true,
            deletedCount: result.deletedCount
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});



app.get('/books/aggregate1', async (req, res) => {
    try {
        
        const books = await mongoose.connection.db.collection("books").aggregate([
            { 
                $match: { year: { $gt: 2000 } } 
            },
            { 
                $sort: { year: -1 } 
            }
        ]).toArray();
        
        res.status(200).json(books);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


app.get('/books/aggregate2', async (req, res) => {
    try {
        const books = await mongoose.connection.db.collection("books").aggregate([
            { 
                $match: { year: { $gt: 2000 } } 
            },
            { 
                $project: { 
                    _id: 0,       
                    title: 1,     
                    author: 1,    
                    year: 1       
                } 
            }
        ]).toArray();
        
        res.status(200).json(books);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


app.get('/books/aggregate3', async (req, res) => {
    try {
        const books = await mongoose.connection.db.collection("books").aggregate([
            {
                $unwind: "$genres" 
            },
            {
                $project: {
                    _id: 0,      
                    title: 1,  
                    genres: 1    
                }
            }
        ]).toArray();
        
        res.status(200).json(books);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});



app.get('/books/aggregate4', async (req, res) => {
    try {
        const results = await mongoose.connection.db.collection("logs").aggregate([
            {
                $lookup: {
                    from: "books",            
                    localField: "book_id",     
                    foreignField: "_id",       
                    as: "book_details"         
                }
            },
            {
                $project: {
                    _id: 0,                    
                    action: 1,                 
                    book_details: 1           
                }
            }
        ]).toArray();
        
        res.status(200).json(results);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.listen(3000, () => console.log('Server running on port 3000'));