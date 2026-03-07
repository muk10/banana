const express = require("express");

const app = express();

app.get("/", (req, res) => {
  res.send("My API is running");
});

const PORT = process.env.PORT || 3002;

app.listen(PORT, () => {
  console.log("Server started");
});