const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 5000;

// middlewares
app.use(cors());
app.use(express.json());
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.q1ga5lh.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});
app.get("/", (req, res) => {
  res.send("Home route");
});
async function run() {
  const serviceCollection = client.db("dentalcare").collection("services");
  const reviewCollection = client.db("dentalcare").collection("reviews");
  app.post("/add-review", async (req, res) => {
    const service = req.body;
    const result = await reviewCollection.insertOne(service);
    res.send(result);
  });
  app.get("/reviews", async (req, res) => {
    let query = {};
    if (req.query.email) {
      query = {
        email: req.query.email,
      };
    }
    const cursor = reviewCollection.find(query);
    const myReviews = await cursor.toArray();
    res.send(myReviews);
  });
  app.delete("/review/delete/:id", async (req, res) => {
    const id = req.params.id;
    const query = { _id: ObjectId(id) };
    const result = await reviewCollection.deleteOne(query);
    res.send(result);
  });
  app.get("/review/:id", async (req, res) => {
    const id = req.params.id;
    const query = { _id: ObjectId(id) };
    const result = await reviewCollection.findOne(query);
    res.send(result);
  });
  app.patch("/review/update/:id", async (req, res) => {
    const id = req.params.id;
    const reviewtext = req.body.reviewtext;
    console.log(reviewtext);
    return;
    const query = { _id: ObjectId(id) };
    const updatedDoc = {
      $set: {
        reviewtext: reviewtext,
      },
    };
    const result = await orderCollection.updateOne(query, updatedDoc);
    res.send(result);
  });
  app.post("/add-service", async (req, res) => {
    const service = req.body;
    const result = await serviceCollection.insertOne(service);
    res.send(result);
  });
  app.get("/services", async (req, res) => {
    const query = {};
    const cursor = serviceCollection.find(query);
    const services = await cursor.toArray();
    res.send(services);
  });
  app.get("/service", async (req, res) => {
    const query = {};
    const cursor = serviceCollection.find(query).limit(3);
    const service = await cursor.toArray();
    res.send(service);
  });
  app.get("/services/:id", async (req, res) => {
    const id = req.params.id;
    const query = { _id: ObjectId(id) };
    const service = await serviceCollection.findOne(query);
    res.send(service);
  });
}
run().catch((err) => console.error(err));
app.listen(port, () => {
  client.connect((err) => {
    if (err) {
      console.log(err);
    } else {
      console.log("Connected to MongoDB");
    }
  });
});
