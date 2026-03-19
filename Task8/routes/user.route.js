const express = require("express");
const {
	createUser,
	getUsers,
	getUserById,
	updateUser,
	deleteUser,
} = require("../controllers/user.controller");
const {
	protect,
	authorize,
	authorizeSelfOrAdmin,
} = require("../middleware/auth.middleware");
const {
	validateCreateUser,
	validateUpdateUser,
	validateObjectId,
	validatePagination,
} = require("../middleware/validate.middleware");

const router = express.Router();

router.use(protect);

router
	.route("/")
	.post(authorize("admin"), validateCreateUser, createUser)
	.get(authorize("admin"), validatePagination, getUsers);

router
	.route("/:id")
	.get(authorizeSelfOrAdmin(), validateObjectId, getUserById)
	.patch(authorizeSelfOrAdmin(), validateObjectId, validateUpdateUser, updateUser)
	.delete(authorize("admin"), validateObjectId, deleteUser);

module.exports = router;
