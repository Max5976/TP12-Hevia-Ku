const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const requireAdmin = require("../middleware/requireAdmin");
const { listUsers } = require("../controllers/adminController");

const router = express.Router();

router.get("/all", authMiddleware, requireAdmin, listUsers);

module.exports = router;
