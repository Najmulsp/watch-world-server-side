const express = require('express');
const app = express();
const cors = require('cors')
const port = process.env.PORT || 5000;
const { MongoClient, ServerApiVersion } = require('mongodb');
require('dotenv').config()

// middleware
app.use(cors());
app.use(express.json());






const uri = `mongodb+srv://${process.env.USER_DB}:${process.env.PASS_DB}@cluster0.njogpdx.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    const productCollection = client.db('WatchWorld').collection('products');
    // Send a ping to confirm a successful connection
    // await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");

    app.get('/allProducts', async (req, res) =>{
      const { sort, brand, category, priceRange, search } = req.query;
      let query = {};

      // Search filter
      if (search) {
        query.name = { $regex: search, $options: 'i' }; // Case insensitive search
      }

      // Brand filter
      if (brand) {
        query.brand = { $regex: brand, $options: 'i' }; // Case insensitive filter
      }

      // Category filter
      if (category) {
        query.category = { $regex: category, $options: 'i' }; // Case insensitive filter
      }

      // Price range filter
      if (priceRange) {
        const [min, max] = priceRange.split('-').map(Number);
        query.price = { $gte: min, $lte: max };
      }

      // Fetch the products from the database
      let products = await productCollection.find(query).toArray();

      // Sorting
      if (sort === 'price-asc') {
        products.sort((a, b) => a.price - b.price);
      } else if (sort === 'price-desc') {
        products.sort((a, b) => b.price - a.price);
      } else if (sort === 'date-desc') {
        products.sort((a, b) => new Date(b.date) - new Date(a.date));
      }

      res.json(products);
    
    });




  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);


app.get('/', (req, res) =>{
    res.send('watch world is running on server')
})

app.listen(port, () =>{
    console.log(`watch world is running on port ${port}`);
})