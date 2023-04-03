/* 
 Name: Aniruth
 Class: CSC 
 Description: server.js shows the different server requests using express & mongo DB for the Ostaa Website (part 2).
 Date: 04/01/2023
*/
const express = require("express");
const mongoose = require("mongoose");
const crypto = require("crypto");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const streamifier = require("streamifier");

const ItemSchema = new mongoose.Schema({
  title: String,
  description: String,
  image: String,
  price: Number,
  status: String,
  owner: String,
  owner: String,
});

const UserSchema = new mongoose.Schema({
  username: String,
  password: String,
  listings: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Item",
    },
  ],
  purchases: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Item",
    },
  ],
});

const User = mongoose.model("User", UserSchema);
const Item = mongoose.model("Item", ItemSchema);

const upload = multer({
  limits: { fileSize: 1000000, files: 1 },
  storage: multer.memoryStorage(),
});
const port = process.env.PORT || 3000;
const dbURL = "mongodb://127.0.0.1:27017/ostaa";
const sessions = {};

const app = express();

app.use(express.static("public_html"));
app.use(express.json({ extended: false, limit: "50mb" }));
app.use(
  express.urlencoded({ limit: "50mb", extended: false, parameterLimit: 50000 })
);

app.get("/get/myself", async (req, res) => {
  const sessionId = req.headers.cookie?.split("=")[1];
  const user = sessions[sessionId];
  if (user) {
    return res.json({ ok: true, data: user });
  } else {
    return res.json({ ok: false, message: "Unauthorized!" });
  }
});

app.get("/get/users", async (req, res) => {
  const users = await User.find({}).exec();
  res.json(users);
});

app.get("/get/items", async (req, res) => {
  const items = await Item.find({}).exec();
  res.json(items);
});

app.get("/get/listings/:username", async (req, res) => {
  const user = await User.findOne({ username: req.params.username })
    .populate("listings")
    .exec();
  if (user) {
    res.json(user.listings);
  } else {
    res.json({ ok: false, message: "No user found" });
  }
});

app.get("/get/purchases/:username", async (req, res) => {
  const user = await User.findOne({ username: req.params.username })
    .populate("purchases")
    .exec();
  if (user) {
    res.json(user.purchases);
  } else {
    res.json({ ok: false, message: "No user found" });
  }
});

app.get("/search/users/:keyword", async (req, res) => {
  const keyword = req.params.keyword;
  const users = await User.find({
    username: { $regex: keyword, $options: "i" },
  }).exec();
  res.json(users);
});

app.get("/search/items/:keyword", async (req, res) => {
  const keyword = req.params.keyword;
  const items = await Item.find({
    description: { $regex: keyword, $options: "i" },
  }).exec();
  res.json(items);
});

app.post("/add/user", async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await User.findOne({ username }).exec();
    if (user) {
      return res.json({
        ok: false,
        message: "A user already exists with that username",
      });
    }
    const newUser = await User.create({
      username,
      password,
      listings: [],
      purchases: [],
    });
    newUser.save();
    res.json({ ok: true, message: "User Created!" });
  } catch (e) {
    res.json({ ok: false, message: "server error" });
  }
});

app.post("/login", async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await User.findOne({ username, password }).exec();
    if (!user) {
      return res.json({
        ok: false,
        message: "Issue logging in with that info",
      });
    } else {
      const uuid = crypto.randomUUID();
      sessions[uuid] = username;
      res.cookie("sessionId", uuid);
      return res.json({
        ok: true,
        message: "Login Success",
      });
    }
  } catch (e) {
    res.json({ ok: false, message: "server error" });
  }
});

app.post("/add/item/:username", upload.single("image"), async (req, res) => {
  const username = req.params.username;
  const { file, body } = req;
  let image;
  try {
    if (file) {
      const randomString = Math.floor(Math.random() * 1000);
      image = "img_" + randomString + "_" + file.originalname;
      const filePath = path.join(__dirname, `./public_html/images/${image}`);
      await streamifier
        .createReadStream(file.buffer)
        .pipe(fs.createWriteStream(filePath));
    }

    const user = await User.findOne({ username }).exec();
    if (!user) {
      return res.json({ ok: false, message: "No user exists" });
    }
    const newItem = await Item.create({ ...body, owner: username, image });
    newItem.save();
    user.listings.push(newItem.id);
    user.save();
    res.json({ ok: true });
  } catch (e) {
    console.log("error", e);
    res.json({ ok: false, message: "server error" });
  }
});

app.post("/buy/item", async (req, res) => {
  const username = req.body.username;
  const itemId = req.body.itemId;
  try {
    const user = await User.findOne({ username }).exec();
    const item = await Item.findById(itemId).exec();
    if (!user || !item) {
      return res.json({ ok: false, message: "Invalid!" });
    }
    item.status = "SOLD";
    item.save();
    user.purchases.push(item.id);
    user.save();
    res.json({ ok: true });
  } catch (e) {
    console.log("error", e);
    res.json({ ok: false, message: "server error" });
  }
});

mongoose
  .connect(dbURL)
  .then(() => console.log("Connected to Database"))
  .catch((e) => console.log("Error connecting to Database", e));

app.listen(port, () => {
  console.log(`Example app listening on port http://localhost:${port}`);
});
