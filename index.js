const express = require("express");
const cors = require("cors");
require("dotenv").config();
const { MongoClient, ObjectId, ServerApiVersion } = require("mongodb"); 
const app = express();
const port = process.env.PORT || 5000;


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
    await client.connect();
    console.log("Connected to MongoDB");

    const equipCollection = client.db("equipmentstDB").collection('equipments');
    const testimonialCollection = client.db("equipmentstDB").collection('testimonials');

    app.post('/addEquip', async (req, res) => {
      const newAddEquip = req.body;
      console.log(newAddEquip);
      const result = await equipCollection.insertOne(newAddEquip);
      res.send(result);
    });


app.get('/equipment/home', async (req, res) => {
  const equipment = await equipCollection.find().limit(6).toArray(); 
  res.send(equipment);
});

app.get('/equipment', async (req, res) => {
  const equipment = await equipCollection.find().toArray(); 
  res.send(equipment);
});

   
    app.get('/equipment/top-rated', async (req, res) => {
      const topRated = await equipCollection.find().sort({ rating: -1 }).limit(6).toArray();
      res.send(topRated);
    });

  
    app.get('/equipment/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const item = await equipCollection.findOne(query);
      if (item) {
        res.json(item);
      } else {
        res.status(404).send({ message: 'Item not found' });
      }
    });

 
    app.get('/testimonials', async (req, res) => {
      const testimonials = await testimonialCollection.find().toArray();
      res.send(testimonials);
    });

    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("b10 server is running!");
});

app.listen(port, () => {
  console.log(`b10 server is running on port: ${port}`);
});