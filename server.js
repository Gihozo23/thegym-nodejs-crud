const express = require("express");
const fs = require("fs");
const path = require("path");
const { v4: uuidv4 } = require("uuid");
const app = express();
const PORT = 3000;

app.use(express.json());

const dataFilePath = path.join(__dirname, "data.json");

const readDataFromFile = () => {
  const data = fs.readFileSync(dataFilePath);
  return JSON.parse(data);
};
const writeDataToFile = (data) => {
  console.log(typeof data);
  fs.writeFileSync(dataFilePath, JSON.stringify(data, null, 2));
};

// GET request to fetch all items
app.get("/items", (request, response) => {
  const items = readDataFromFile();
  response.status(200).json(items);
});

// POST request to add a new item
app.post("/items", (request, response) => {
  const newItem = {
    id: uuidv4(),
    ...request.body,
  };
  const items = readDataFromFile();
  items.push(newItem);
  writeDataToFile(items);
  response.status(201).json(newItem);
});

//PUT request to update an existing item
app.put("/items/:id", (request, response) => {
  const { id } = request.params;
  const updatedItemBody = request.body;
  if (!Object.keys(request.body).length) {
    return response
      .status(400)
      .json({ message: "There is no update data provided" });
  }
  const items = readDataFromFile();
  const updatedIndex = items.findIndex((item) => item.id === id);
  if (updatedIndex === -1)
    return response.status(404).json({ message: "Item not found" });
  items[updatedIndex] = { id, ...updatedItemBody };
  writeDataToFile(items);
  response.status(200).json(items[updatedIndex]);
});

// DELETE request to delete an exisiting item
app.delete("/items/:id", (request, response) => {
  const { id } = request.params;

  const items = readDataFromFile();

  const remainingItems = items.filter((item) => item.id !== id);

  if (remainingItems.length === items.length)
    return response.status(404).json({ message: "file was not found" });

  writeDataToFile(remainingItems);
  response.status(200).json({ message: "item successfully deleted" });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
