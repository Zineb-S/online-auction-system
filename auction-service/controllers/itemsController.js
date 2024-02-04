const Item = require('../models/Item');

// Get all items
exports.getAllItems = async (req, res) => {
  try {
    const items = await Item.find();
    res.json(items);
  } catch (error) {
    res.status(500).send({ message: "Error fetching items", error: error.message });
  }
};

// Get an item by ID
exports.getItemById = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) {
      return res.status(404).send({ message: 'Item not found' });
    }
    res.json(item);
  } catch (error) {
    res.status(500).send({ message: "Error fetching item by ID", error: error.message });
  }
};

// Create a new item
exports.createItem = async (req, res) => {
  try {
    const newItem = new Item(req.body);
    const savedItem = await newItem.save();
    res.status(201).json(savedItem);
  } catch (error) {
    res.status(500).send({ message: "Error creating new item", error: error.message });
  }
};

// Update an item
exports.updateItem = async (req, res) => {
  try {
    const updatedItem = await Item.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedItem) {
      return res.status(404).send({ message: 'Item not found' });
    }
    res.json(updatedItem);
  } catch (error) {
    res.status(500).send({ message: "Error updating item", error: error.message });
  }
};

// Delete an item
exports.deleteItem = async (req, res) => {
  try {
    const deletedItem = await Item.findByIdAndDelete(req.params.id);
    if (!deletedItem) {
      return res.status(404).send({ message: 'Item not found' });
    }
    res.send({ message: 'Item deleted successfully' });
  } catch (error) {
    res.status(500).send({ message: "Error deleting item", error: error.message });
  }
};
