const express = require('express');
const mongoose = require('mongoose');
var cors = require('cors');

require('dotenv').config();



// Initialize Express app
const app = express();
app.use(cors());
const PORT = process.env.PORT || 8000;

// Connect to MongoDB
mongoose.connect(process.env.DB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
});
const db = mongoose.connection;

// Define a Schema for the data
const itemSchema = new mongoose.Schema({
    name: String,
    description: String,
    url: String,
    createdDate: {
        type: Date,
        default: Date.now
    }
});

// Create a Model based on the Schema
const Item = mongoose.model('Item', itemSchema);

// Middleware to parse JSON bodies
app.use(express.json());


///fetch the blog 
app.get('/bloglist', async (req, res) => {
    try {
        const items = await Item.find();
        res.json(items);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});


app.post('/items', async (req, res) => {
    const item = new Item({
        name: req.body.name,
        description: req.body.description,
        url: req.body.url
    });

    try {
        const newItem = await item.save();
        res.status(201).json(newItem);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

app.get('/items/:id', async (req, res) => {
    const itemId = req.params.id; // Extract item ID from request parameters

    try {
        const item = await Item.findById(itemId);
        if (!item) {
            return res.status(404).json({ message: 'Item not found' });
        }

        res.status(200).json(item); // Respond with the item
    } catch (err) {
        res.status(400).json({ message: err.message });
    }

});



//blog edit
app.put('/items/:id', async (req, res) => {
    const { name, description, url } = req.body;
    const itemId = req.params.id; // Extract item ID from request parameters

    try {
        let item = await Item.findById(itemId);
        if (!item) {
            return res.status(404).json({ message: 'Item not found' });
        }

        // Update the item properties
        item.name = name;
        item.description = description;
        item.url = url;

        // Save the updated item
        const updatedItem = await item.save();

        res.status(200).json(updatedItem); // Respond with the updated item
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});




//blog delete
app.delete('/items/:id', async (req, res) => {
    const itemId = req.params.id;

    try {
        const deletedItem = await Item.findByIdAndDelete(itemId);

        if (!deletedItem) {
            return res.status(404).json({ message: 'Item not found' });
        }

        res.status(200).json({ message: 'Item deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});



// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
