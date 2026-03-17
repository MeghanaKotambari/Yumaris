const express = require("express");
const {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
} = require("../controllers/product.controller");

const router = express.Router();

router.route("/").post(createProduct).get(getAllProducts);
router
  .route("/:id")
  .get(getProductById)
  .put(updateProduct)
  .delete(deleteProduct);

module.exports = router;
