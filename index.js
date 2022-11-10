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

function verifyJwt(req, res, next) {
  const authAccess = req.headers.authorization;
  if (!authAccess) {
    return res.status(401).send({ message: "Unauthorized access" });
  }
  const token = authAccess.split(" ")[1];
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, function (err, decoded) {
    if (err) {
      return res.status(401).send({ message: "Unauthorized access" });
    }
    req.decoded = decoded;
    next();
  });
}
async function run() {
  const serviceCollection = client.db("dentalcare").collection("services");
  const reviewCollection = client.db("dentalcare").collection("reviews");
  app.post("/jwt", (req, res) => {
    const user = req.body;
    const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
      expiresIn: "10h",
    });
    res.send({ token });
  });
  app.post("/add-review", async (req, res) => {
    const review = req.body;
    review.created_at = new Date();
    const result = await reviewCollection.insertOne(review);
    res.send(result);
  });
  //get logged user all review
  app.get("/reviews", verifyJwt, async (req, res) => {
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
  //get all review according to specific service
  app.get("/reviews/:id", async (req, res) => {
    let query = {};
    var mysort = { created_at: -1 };
    const id = req.params.id;
    query = {
      serviceId: id,
    };
    const cursor = reviewCollection.find(query).sort(mysort);
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
    const query = { _id: ObjectId(id) };
    const updatedDoc = {
      $set: {
        reviewtext: reviewtext,
      },
    };
    const result = await reviewCollection.updateOne(query, updatedDoc);
    res.send(result);
  });
  app.post("/add-service", async (req, res) => {
    const service = req.body;
    service.created_at = new Date();
    const result = await serviceCollection.insertOne(service);
    res.send(result);
  });
  // app.post("/add-service", async (req, res) => {
  //   const service = req.body;
  //   const result = await serviceCollection.insertOne(
  //     Object.assign({}, service, { created_at: new Date() })
  //   );
  //   res.send(result);
  // });
  app.get("/services", async (req, res) => {
    const query = {};
    var mysort = { created_at: -1 };
    const cursor = serviceCollection.find(query).sort(mysort);
    const services = await cursor.toArray();
    res.send(services);
  });
  app.get("/service", async (req, res) => {
    const query = {};
    var mysort = { created_at: -1 };
    const cursor = serviceCollection.find(query).sort(mysort).limit(3);
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

app.get("/", (req, res) => {
  res.send("Home route");
});
app.listen(port, () => {
  client.connect((err) => {
    if (err) {
      console.log(err);
    } else {
      console.log("Connected to MongoDB");
    }
  });
});
