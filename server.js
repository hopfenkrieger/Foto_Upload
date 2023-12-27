const express = require("express");
const cloudinary = require("cloudinary").v2;
const fse = require("fs-extra");
const axios = require("axios");
const app = express();

require("dotenv").config();

app.use(express.static("public"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

const cloudinaryConfig = cloudinary.config({
  cloud_name: process.env.CLOUDNAME,
  api_key: process.env.CLOUDAPIKEY,
  api_secret: process.env.CLOUDINARYSECRET,
  secure: true,
});

function passwordProtected(req, res, next) {
  res.set("WWW-Authenticate", "Basic realm='Cloudinary Front-end Upload'");
  if (req.headers.authorization == "Basic YWRtaW46YWRtaW4=") {
    next();
  } else {
    res.status(401).send("Try again");
  }
}

app.use(passwordProtected);

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/public/index.html");
});

app.get("/get-signature", async (req, res) => {
  const timestamp = Math.round(new Date().getTime() / 1000);
  const signature = cloudinary.utils.api_sign_request(
    {
      timestamp: timestamp,
    },
    cloudinaryConfig.api_secret
  );
  res.json({ timestamp, signature });
});

app.post("/do-something-with-photo", async (req, res) => {
  const expectedSignature = cloudinary.utils.api_sign_request(
    { public_id: req.body.public_id, version: req.body.version },
    cloudinaryConfig.api_secret
  );

  if (expectedSignature === req.body.signature) {
    await fse.ensureFile("./data.txt");
    const existingData = await fse.readFile("./data.txt", "utf8");
    await fse.outputFile("./data.txt", existingData + req.body.public_id + "\n");
  }
});

app.get("/view-photos", async (req, res) => {
  await fse.ensureFile("./data.txt");
  const existingData = await fse.readFile("./data.txt", "utf8");
  res.sendFile(__dirname + "/public/view-photos.html");
});

app.post("/delete-photo", async (req, res) => {
  await fse.ensureFile("./data.txt");
  const existingData = await fse.readFile("./data.txt", "utf8");
  await fse.outputFile(
    "./data.txt",
    existingData
      .split("\n")
      .filter((id) => id != req.body.id)
      .join("\n")
  );

  cloudinary.uploader.destroy(req.body.id);

  res.redirect("/view-photos");
});

app.listen(3000, () => {
  console.log("Server is running on http://localhost:3000");
});