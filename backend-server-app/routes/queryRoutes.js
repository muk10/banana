const express = require("express");
const router = express.Router();
const {
  createQuery,
  getAdminQueries,
  replyToQuery,
} = require("../controllers/queryController");
const { validate } = require("../utils/validators");
const {
  createQuerySchema,
  replyQuerySchema,
} = require("../utils/validators");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

router.post(
  "/",
  authMiddleware,
  roleMiddleware("donor"),
  validate(createQuerySchema),
  createQuery
);

router.get(
  "/admin",
  authMiddleware,
  roleMiddleware("admin"),
  getAdminQueries
);

router.post(
  "/reply",
  authMiddleware,
  roleMiddleware("admin"),
  validate(replyQuerySchema),
  replyToQuery
);

module.exports = router;

