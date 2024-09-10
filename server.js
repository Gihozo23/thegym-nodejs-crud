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
  fs.writeFileSync(dataFilePath, JSON.stringify(data, null, 2));
};

// GET request to fetch all items
app.get("/get-items", (request, response) => {
  console.log("The request method: ", request.method);
  const items = readDataFromFile();
  response.status(200).json(items);
});

// POST request to add a new item
app.post("/post-items", (request, response) => {
  console.log("The request method: ", request.method);
  const newItem = {
    id: uuidv4(),
    ...request.body,
  };
  if (!newItem.name || !newItem.description) {
    return response
      .status(400)
      .json({ message: "Item must have a name and description" });
  }
  const items = readDataFromFile();
  items.push(newItem);
  writeDataToFile(items);
  response.status(201).json(newItem);
});

//PUT request to update an existing item
app.put("/items/:id", (request, response) => {
  console.log("The request method: ", request.method, request.params);
  const { id } = request.params;
  const updatedBody = request.body;
  const items = readDataFromFile();
  const updatedIndex = items.findIndex((item) => item.id === id);
  if (updatedIndex === -1)
    return response.status(404).json({ message: "Item not found" });
  items[updatedIndex] = { id, ...updatedBody };
  writeDataToFile(items);
  response.status(200).json(items[updatedIndex]);
});

// DELETE request to delete an exisiting item
app.delete("/delete-items/:id", (request, response) => {
  console.log("The request method: ", request.method, request.params);
  const { id } = request.params;

  const items = readDataFromFile();

  const remainingItems = items.filter((item) => item.id !== id);

  if (remainingItems.length === items.length)
    return response.status(404).json({ message: "file was not found" });

  writeDataToFile(remainingItems);
  response.status(204).json({ message: "item successfully deleted" });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
