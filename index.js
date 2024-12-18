const express = require('express');
const cors = require('cors');
require('dotenv').config();
const app = express();
const PORT = process.env.PORT || 5001;

// middleware
app.use(cors());
app.use(express.json());

const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.pnlgi.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server (ensure only once)
    await client.connect();

    const productCollection = client.db('emaJohnDB').collection('products');

    // Pagination-enabled products API
    app.get('/products', async (req, res) => {
      console.log(req.query);
      const page = parseInt(req.query.page) || 0;
      const limit = parseInt(req.query.limit) || 15;
      const skip = page * limit;

      const result = await productCollection
        .find()
        .skip(skip)
        .limit(limit)
        .toArray();
      res.send(result);
    });

    // Fetch multiple products by IDs
    app.post('/productByIds', async (req, res) => {
      const ids = req.body;
      console.log(ids);
      const idsWithObjectId = ids.map((id) => new ObjectId(id));
      const query = {
        _id: {
          $in: idsWithObjectId,
        },
      };
      const result = await productCollection.find(query).toArray();
      res.send(result);
    });

    // Product count for pagination
    app.get('/productCount', async (req, res) => {
      console.log('pagination query', req.query);
      const count = await productCollection.estimatedDocumentCount();
      res.send({ totalProducts: count });
    });

    // Send a ping to confirm a successful connection
    await client.db('admin').command({ ping: 1 });
    console.log('Pinged your deployment. You successfully connected to MongoDB!');
  } finally {
    // Uncomment the below line to close the client if needed
    // await client.close();
  }
}
run().catch(console.dir);

// Test endpoint
app.get('/', (req, res) => {
  res.send('john is busy shopping');
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
