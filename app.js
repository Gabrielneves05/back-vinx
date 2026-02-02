require("dotenv").config();

const express = require("express");
const path = require("path");
const cors = require("cors");

// DB connection
require("./config/db");

const port = process.env.PORT || 3333;

const app = express();

// configs JSON and form data response
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Resolve CORS (liberado para produção e dev)
app.use(
  cors({
    origin: true,
    credentials: true,
  })
);

// Upload directory images
app.use("/uploads", express.static(path.join(__dirname, "/uploads")));

// routes
const router = require("./routes/Router");

app.use(router);

app.listen(port, () => {
  console.log(`App is running on port ${port}`);
});
