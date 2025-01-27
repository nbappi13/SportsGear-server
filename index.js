const express = require("express");
const cors = require("cors");
require("dotenv").config();
const { MongoClient, ServerApiVersion } = require("mongodb");
const app = express();
const port = process.env.PORT || 5000;

// Middleware use
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.0fter.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;
console.log(uri);

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server (optional starting in v4.7)
    await client.connect();

    const equipCollection = client.db("equipmentstDB").collection('equipments');

    app.post('/addEquip', async (req, res) => {
      const newAddEquip = req.body;
      console.log(newAddEquip);
      const result = await equipCollection.insertOne(newAddEquip);
      res.send(result);
    });

    app.get('/equipment', async (req, res) => {
      const equipment = await equipCollection.find().limit(6).toArray(); // Limit to 6 items
      res.send(equipment);
    });

    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client close;
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("b10 server is running!");
});

app.listen(port, () => {
  console.log(`b10 server is running on port: ${port}`);
});
