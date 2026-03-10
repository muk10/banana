const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const { signup, login } = require("../controllers/authController");

router.post("/signup", signup);
router.post("/login", login);

router.get("/profile", auth, (req, res) => {
  res.json({ message: "This is a protected profile", userId: req.user.id });
});

module.exports = router;