const express = require("express");
const router = express();

router.use("/api/users", require("./UserRoutes"));

// test
router.get("/", (req, res) => {
    res.send("Hello World!");
});

module.exports = router;