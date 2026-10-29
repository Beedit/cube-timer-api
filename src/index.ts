import express from "express";
import logger from "./util/logger.js";
import Database from "./util/classes/database.js";

// Express app setup
const port = 5000;
const app = express();
app.use(express.json());
const db = new Database("db.sqlite");

// Log the request, ip and time when a request is made
app.use(function (req, _res, next) {
    logger.info(`Incoming ${req.method} request from ${req.ip} at ${new Date().toISOString()} on ${req.url}`);
    next();
});

// Unused methods and bad requests.
app.all("/{*splat}", (req, res) => {
    res.send(`${req.method} not supported on ${req.path}\n`);
});

app.listen(port, async () => {
    await db.init();
    logger.info(`Listening on port ${port}`);
});
