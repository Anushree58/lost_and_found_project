const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect("mongodb://127.0.0.1:27017/lostfound")
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.log(err));

// Create Schema
const itemSchema = new mongoose.Schema({
  name: String,
  location: String,
  category: String,
  contact: String,
  uniqueDetail: String,
  type: String,
  createdAt: { type: Date, default: Date.now }
});

const Item = mongoose.model("Item", itemSchema);

// Add item
app.post("/add", async (req, res) => {
  const newItem = new Item(req.body);
  await newItem.save();
  res.json({ message: "Item added successfully" });
});

// Get all items
app.get("/items", async (req, res) => {
  const items = await Item.find();
  res.json(items);
});

// Delete item
app.delete("/delete/:id", async (req, res) => {
  await Item.findByIdAndDelete(req.params.id);
  res.json({ message: "Item deleted successfully" });
});
// Search items by name
app.get("/search", async (req, res) => {
  const query = req.query.name;

  const items = await Item.find({
    name: { $regex: query, $options: "i" }  // case-insensitive search
  });

  res.json(items);
});

app.listen(5000, () => {
  console.log("Server running on port 5000");
});