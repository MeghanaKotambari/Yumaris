const express = require("express")

const app = express()
const PORT = 5000

// Sample product data
const products = [
  {
    id: 1,
    name: "Laptop",
    price: 60000
  },
  {
    id: 2,
    name: "Mobile",
    price: 20000
  },
  {
    id: 3,
    name: "Headphones",
    price: 2000
  }
]

// GET API endpoint
app.get("/api/products", (req, res) => {
  res.json(products)
})

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})