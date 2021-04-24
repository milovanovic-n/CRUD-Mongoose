const Product = require("./models/product");

// CONNECT MONGODB
const mongoose = require("mongoose");
mongoose.connect("mongodb://localhost:27017/farmStand", { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log("CONNECTED TO MongoDB"); 
  })
  .catch(err => {
    console.log("ERROR WHILE CONNECTING TO MongoDB");
    console.log(err);
  });

const seedsProducts = [
  {
    name: "Fairy Eggplant",
    price: 1.00,
    category: "vegetable"
  },
  {
    name: "Organic Goddess Melon",
    price: 4.99,
    category: "fruit"
  },
  {
    name: "Organic Mini Seedles Watermelon",
    price: 3.99,
    category: "fruit"
  },
  {
    name: "Organic Celery",
    price: 1.50,
    category: "fruit"
  },
  {
    name: "Chocolate Whole Milk",
    price: 2.69,
    category: "dairy"
  }
];

// Product.insertMany(seedsProducts)
//   .then(res => {
//     console.log(res);
//   })
//   .catch(err => {
//     console.log(err);
//   });