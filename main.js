const express = require("express");
const path = require("path");
const fsPromises = require("fs/promises");

const app = express();

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

app.post("/api/upload/blob", async (req, res, next) => {
  try {
    const rawBody = await new Promise((resolve, reject) => {
      const chunks = [];

      req.on("data", (chunk) => chunks.push(chunk));
      req.on("end", () => resolve(Buffer.concat(chunks)));
      req.on("error", (err) => reject(err));
    });

    const outputDirectory = path.join(__dirname, "tmp");
    const outputFilename = Date.now() + req.query.extname;
    const outputPath = path.join(outputDirectory, outputFilename);

    await fsPromises.mkdir(outputDirectory, { recursive: true });
    await fsPromises.writeFile(outputPath, rawBody);

    res.status(201).end();
  } catch (err) {
    next(err);
  }
});

app.post("/api/upload/dataurl", express.json(), async (req, res, next) => {
  try {
    const recordedVideoBuffer = Buffer.from(
      req.body.dataUrl.split("base64,")[1],
      "base64"
    );

    const outputDirectory = path.join(__dirname, "tmp");
    const outputFilename = Date.now() + req.body.extname;
    const outputPath = path.join(outputDirectory, outputFilename);

    await fsPromises.mkdir(outputDirectory, { recursive: true });
    await fsPromises.writeFile(outputPath, recordedVideoBuffer);

    res.status(201).end();
  } catch (err) {
    next(err);
  }
});

app.listen(3000);
