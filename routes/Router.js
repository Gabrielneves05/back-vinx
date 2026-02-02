const express = require("express");

const router = express.Router();

router.use("/api/users", require("./UserRoutes"));
router.use("/api/photos", require("./PhotoRoutes"));

// rota de teste
router.get("/", (req, res) => {
  res.send("Hello World!");
});

module.exports = router;
