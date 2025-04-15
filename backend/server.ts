import express from "express";
const app = express();
const PORT = 5001;

app.get("/", (req, res) => {
  res.send("Hello, world!");
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
