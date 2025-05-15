import express from "express";
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

app.post("/pdf", (req, res) => {
  res.send("Hello World!");
  console.log(req)
});

app.listen(5000);
