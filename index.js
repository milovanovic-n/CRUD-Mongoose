const express = require("express");
const app = express();
const path = require("path");
const methodOverride = require("method-override");
const PORT = 3000;

// REQUIRE PRODUCT MODEL
const Product = require("./models/product");
// REQUIRE FARM MODEL
const Farm = require("./models/farm");

// CONNECT MONGODB
const mongoose = require("mongoose");
mongoose.connect("mongodb://localhost:27017/farmStand", { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false })
  .then(() => {
    console.log("CONNECTED TO MongoDB"); 
  })
  .catch(err => {
    console.log("ERROR WHILE CONNECTING TO MongoDB");
    console.log(err);
  });

// SERVE STATIC FILES
app.set("views", path.join(__dirname, "views"));
// SET VIEW ENGINE TO EJS
app.set("view engine", "ejs");
// BEACUSE WE DONT HAVE ACCESS TO req.body
app.use(express.urlencoded({ extended: true }));
// SET METHOD - OVERRIDE
app.use(methodOverride("_method"));


/*
 * FARM ROUTES
*/

// FARMS PAGE
app.get("/farms", async (req, res) => {
  try {
    const farms = await Farm.find({});
    res.render("farms/index", { farms });
  } catch(err) {
    console.log(err);
    res.send("CANNOT FIND ANY FARMS AT THE MOMENT, PLEASE TRY LATER!");
  }
});

// SHOW FORM FOR CREATING NEW FARM
app.get("/farms/new", (req, res) => {
  res.render("farms/new");
});

// SUBMIT FORM - CREATE FARM
app.post("/farms", async (req, res) => {
  try {
    const { name, city, email } = req.body;
    const farm = new Farm({
      name,
      city,
      email
    });
    await farm.save();
    res.redirect("/farms");
  } catch(err) {
    console.log(err);
    res.send("ERROR WHILE CREATING THE FARM");
  }
});

// FARM DETAILS PAGE
app.get("/farms/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const farm = await Farm.findById(id).populate("products");
    res.render("farms/show", { farm });
  } catch(err) {
    res.send("FARM NOT FOUND!");
  }
});

// SHOW FORM TO ADD PRODUCT TO A PARTICULAR FARM
app.get("/farms/:id/products/new", async (req, res) => {
  const { id } = req.params;
  const farm = await Farm.findById(id);
  res.render("products/new", { categories, farm });
});

// SUBMIT FORM FOR THE FARM`S PRODUCT
app.post("/farms/:id/products", async (req, res) => {
  try {
    const { id } = req.params;
    const farm = await Farm.findById(id);
    const { name, price, category } = req.body;
    const product = new Product({
      name, price, category
    });
    farm.products.push(product);
    product.farm = farm;
    await farm.save();
    await product.save();
    res.redirect(`/farms/${id}`);
  } catch(err) {
    console.log(err);
  }
});

// DELETE FARM AND RELATED PRODUCTS
app.delete("/farms/:id", async (req, res) => {
  const { id } = req.params;
  const farm = await Farm.findByIdAndDelete(id);
  res.redirect("/farms");
}); 


/*
 * PRODUCT ROUTES
*/
// CATEGORIES
const categories = ["fruit", "vegetable", "dairy"];

// PRODUCTS PAGE
app.get("/products", async (req, res) => {
  try {
    const { category } = req.query;
    if(category) {
      const products = await Product.find({ category });
      res.render("products/index", { products, category });
    } else {
      const products = await Product.find({});
      res.render("products/index", { products, category: "All" });
    }
  } catch(err) {
    res.status(404).send("CANNOT FIND ANY PRODUCTS, PLEASE TRY LATER!");
  }
});

// SHOW FORM FOR CREATING NEW PRODUCT
app.get("/products/new", (req, res) => {
  res.render("products/new", { categories });
});

// SUBMIT FORM - CREATE PRODUCT
app.post("/products", async (req, res) => {
  try {
    const { name, price, category } = req.body;
    const newProduct = new Product({
      name,
      price,
      category
    });
    await newProduct.save();
    res.redirect(`/products/${newProduct._id}`);
  } catch(err) {
    console.log(err);
    res.send("ERROR WHILE CREATING THE PRODUCT");
  }
});

// PRODUCT DETAILS PAGE
app.get("/products/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findById(id).populate("farm", "name");
    res.render("products/show", { product });
  } catch(err) {
    res.send("PRODUCT NOT FOUND!");
  }
});

// SHOW EDIT FORM  - UPDATE PRODUCT
app.get("/products/:id/edit", async (req, res) => {
  try { 
    const { id } = req.params;
    const product = await Product.findById(id);
    res.render("products/edit", { product, categories });
  } catch(err) {
    console.log(err);
    res.send("ERROR WHILE UPDATING PRODUCT!")
  }
});

// SUBMIT EDIT FORM - UPDATE PRODUCT
app.put("/products/:id", async (req, res) => {
  const { id } = req.params;
  const { name, price, category } = req.body;
  const product = await Product.findByIdAndUpdate(id, {
    name,
    price,
    category
  }, { new: true, runValidators: true });
  res.redirect(`/products/${product._id}`);
});

app.delete("/products/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await Product.findByIdAndDelete(id);
    res.redirect("/products");
  } catch(err) {
    console.log("ERROR DELETING PRODUCT", err);
    res.send("ERROR DELETING PRODUCT");
  }
});





// IF ROUTE DOESN`T EXIST SHOW -PAGE NOT FOUND-
app.get("*", (req, res) => {
  res.send("PAGE NOT FOUND!");
});

// RUN SERVER
app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});