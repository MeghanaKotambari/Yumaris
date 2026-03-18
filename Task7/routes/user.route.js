const express = require("express");
const {
  createUser,
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
} = require("../controllers/user.controller");
const { protect } = require("../middleware/authMiddleware");
const {
  validateCreateUser,
  validateUpdateUser,
  validateObjectId,
} = require("../middleware/validateMiddleware");

const router = express.Router();

router.use(protect);

router.route("/").post(validateCreateUser, createUser).get(getUsers);
router
  .route("/:id")
  .get(validateObjectId, getUserById)
  .put(validateObjectId, validateUpdateUser, updateUser)
  .delete(validateObjectId, deleteUser);

module.exports = router;
