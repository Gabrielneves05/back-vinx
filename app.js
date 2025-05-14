const express = require("express");
const path = require("path");
const cors = require("cors");

const port = 3333;

const app = express();

// configs JSON and form data response

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.listen(port, () => {
    console.log(`App is running on port ${port}`);
});