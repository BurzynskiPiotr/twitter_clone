const express = require("express");
const cors = require("cors");
const monk = require("monk");
const Filter = require("bad-words");
const rateLimit = require("express-rate-limit");

const app = express();

const db = monk("localhost/meower");
const mews = db.get("mews");
const filter = new Filter();

// app use

app.use(cors());
app.use(express.json());

// app get's

app.get("/", (req, res) => {
  res.json({
    message: "Moew hehe!",
  });
});

app.get("/mews", (req, res) => {
  mews.find().then((mews) => {
    res.json(mews);
  });
});

// checking for form validation

function isValidMew(mew) {
  return (
    mew.name &&
    mew.name.toString().trim() !== "" &&
    mew.content &&
    mew.content.toString().trim() !== ""
  );
}

// reminder: order in express matters - thats why this app.use is down here

app.use(
  rateLimit({
    windowMs: 30 * 1000, // 30 sec
    max: 1, // limit each IP to 100 request per windowMS
  })
);

// changing strings

app.post("/mews", (req, res) => {
  if (isValidMew(req.body)) {
    //isert into db
    const mew = {
      name: filter.clean(req.body.name.toString()),
      content: filter.clean(req.body.content.toString()),
      created: new Date(),
    };

    mews.insert(mew).then((createdMew) => {
      res.json(createdMew);
    });
  } else {
    res.status(422);
    res.json({
      message: "Name and Content are required.",
    });
  }
});

app.listen(5000, () => {
  console.log("Listening on http://localhost:5000");
});
