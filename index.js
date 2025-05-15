const express = require("express")
const cors = require("cors")
require("dotenv").config()
const { MongoClient, ObjectId, ServerApiVersion } = require("mongodb")

const app = express()
const port = process.env.PORT || 5000

app.use(cors())
app.use(express.json())

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.0fter.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`
console.log(uri)

let client
let clientPromise

if (!global._mongoClientPromise) {
  client = new MongoClient(uri, {
    serverApi: {
      version: ServerApiVersion.v1,
      strict: true,
      deprecationErrors: true,
    },
  })
  global._mongoClientPromise = client.connect()
}

clientPromise = global._mongoClientPromise

async function getDB() {
  const client = await clientPromise
  return client.db("equipmentstDB")
}

app.post("/addEquip", async (req, res) => {
  try {
    const db = await getDB()
    const equipCollection = db.collection("equipments")
    const newAddEquip = req.body
    console.log(newAddEquip)
    const result = await equipCollection.insertOne(newAddEquip)
    res.send({ success: true, result })
  } catch (error) {
    res.status(500).send({ message: "Failed to add equipment", error: error.message })
  }
})

app.get("/equipment/home", async (req, res) => {
  try {
    const db = await getDB()
    const equipCollection = db.collection("equipments")
    const equipment = await equipCollection.find().limit(6).toArray()
    res.send(equipment)
  } catch (error) {
    res.status(500).send({ message: "Error fetching equipment", error: error.message })
  }
})

app.get("/equipment", async (req, res) => {
  try {
    const db = await getDB()
    const equipCollection = db.collection("equipments")
    const equipment = await equipCollection.find().toArray()
    res.send(equipment)
  } catch (error) {
    res.status(500).send({ message: "Error fetching equipment", error: error.message })
  }
})

app.get("/equipment/top-rated", async (req, res) => {
  try {
    const db = await getDB()
    const equipCollection = db.collection("equipments")
    const topRated = await equipCollection.find().sort({ rating: -1 }).limit(6).toArray()
    res.send(topRated)
  } catch (error) {
    res.status(500).send({
      message: "Error fetching top-rated equipment",
      error: error.message,
    })
  }
})


app.get("/equipment/new-arrivals", async (req, res) => {
  try {
    const db = await getDB()
    const equipCollection = db.collection("equipments")

   
    const collectionExists = await db.listCollections({ name: "equipments" }).hasNext()

    if (!collectionExists) {
     
      return res.json([])
    }

  
    const newArrivals = await equipCollection.find().sort({ _id: -1 }).limit(5).toArray()
  
    res.json(newArrivals)
  } catch (error) {
   
  
    res.json([])
  }
})

app.get("/equipment/:id", async (req, res) => {
  try {
    const db = await getDB()
    const equipCollection = db.collection("equipments")
    const id = req.params.id
    const query = { _id: new ObjectId(id) }
    const item = await equipCollection.findOne(query)
    if (item) {
      res.json(item)
    } else {
      res.status(404).send({ message: "Item not found" })
    }
  } catch (error) {
    res.status(500).send({ message: "Error fetching equipment", error: error.message })
  }
})

app.get("/equipment/user/:email", async (req, res) => {
  try {
    const db = await getDB()
    const equipCollection = db.collection("equipments")
    const email = req.params.email
    const equipment = await equipCollection.find({ userEmail: email }).toArray()
    res.send(equipment)
  } catch (error) {
    res.status(500).send({
      message: "Error fetching user's equipment",
      error: error.message,
    })
  }
})

app.put("/equipment/:id", async (req, res) => {
  try {
    const db = await getDB()
    const equipCollection = db.collection("equipments")
    const id = req.params.id
    const updatedEquip = req.body

    delete updatedEquip._id

    const query = { _id: new ObjectId(id) }
    const updateDoc = { $set: updatedEquip }

    const result = await equipCollection.updateOne(query, updateDoc)
    if (result.modifiedCount > 0) {
      res.send({
        success: true,
        message: "Equipment updated successfully",
        updatedData: updatedEquip,
      })
    } else {
      res.status(404).send({ message: "Equipment not found" })
    }
  } catch (error) {
    res.status(500).send({ message: "Error updating equipment", error: error.message })
  }
})

app.delete("/equipment/:id", async (req, res) => {
  try {
    const db = await getDB()
    const equipCollection = db.collection("equipments")
    const id = req.params.id
    const query = { _id: new ObjectId(id) }
    const result = await equipCollection.deleteOne(query)
    res.send(result)
  } catch (error) {
    res.status(500).send({ message: "Error deleting equipment", error: error.message })
  }
})

app.post("/special-deals", async (req, res) => {
  try {
    const db = await getDB()

    const collectionExists = await db.listCollections({ name: "specialDeals" }).hasNext()
    if (!collectionExists) {
      await db.createCollection("specialDeals")
      console.log("Created specialDeals collection")
    }

    const specialDealsCollection = db.collection("specialDeals")
    const newDeal = req.body

    const result = await specialDealsCollection.insertOne(newDeal)
    res.send({ success: true, result })
  } catch (error) {
    console.error("Error in /special-deals POST:", error)
    res.status(500).send({ message: "Failed to add special deal", error: error.message })
  }
})

app.get("/special-deals", async (req, res) => {
  try {
    const db = await getDB()

    const collectionExists = await db.listCollections({ name: "specialDeals" }).hasNext()

    if (collectionExists) {
      const specialDealsCollection = db.collection("specialDeals")
      const deals = await specialDealsCollection.find().toArray()

      if (deals.length > 0) {
        res.send(deals)
        return
      }
    }

    const equipCollection = db.collection("equipments")

    const equipment = await equipCollection.aggregate([{ $sample: { size: 4 } }]).toArray()

    const deals = equipment.map((item) => {
      const originalPrice = Number.parseFloat(item.price)
      const discountPercent = Math.floor(Math.random() * 20) + 10
      const discountedPrice = ((originalPrice * (100 - discountPercent)) / 100).toFixed(2)

      return {
        ...item,
        originalPrice: originalPrice.toFixed(2),
        price: discountedPrice,
      }
    })

    res.send(deals)
  } catch (error) {
    res.status(500).send({ message: "Error fetching special deals", error: error.message })
  }
})

app.get("/special-deals/:id", async (req, res) => {
  try {
    const db = await getDB()
    const specialDealsCollection = db.collection("specialDeals")
    const id = req.params.id
    const query = { _id: new ObjectId(id) }
    const deal = await specialDealsCollection.findOne(query)
    if (deal) {
      res.json(deal)
    } else {
      res.status(404).send({ message: "Deal not found" })
    }
  } catch (error) {
    res.status(500).send({ message: "Error fetching special deal", error: error.message })
  }
})

app.delete("/special-deals/:id", async (req, res) => {
  try {
    const db = await getDB()
    const specialDealsCollection = db.collection("specialDeals")
    const id = req.params.id
    const query = { _id: new ObjectId(id) }
    const result = await specialDealsCollection.deleteOne(query)
    res.send(result)
  } catch (error) {
    res.status(500).send({ message: "Error deleting special deal", error: error.message })
  }
})

app.get("/testimonials", async (req, res) => {
  try {
    const db = await getDB()
    const testimonialCollection = db.collection("testimonials")
    const testimonials = await testimonialCollection.find().toArray()
    res.send(testimonials)
  } catch (error) {
    res.status(500).send({ message: "Error fetching testimonials", error: error.message })
  }
})

app.get("/", (req, res) => {
  res.send("b10 server is running!")
})

app.listen(port, () => {
  console.log(`b10 server is running on port: ${port}`)
})
