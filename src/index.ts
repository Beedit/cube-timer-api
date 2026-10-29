import express from "express";
import * as database from "./util/database.js";

// Express app setup
const port = 5000;
const app = express();
app.use(express.json());

// Log the request, ip and time when a request is made
app.use(function (req, _res, next) {
    console.log(`Incoming ${req.method} request from ${req.ip} at ${new Date().toISOString()} on ${req.url}`);
    next();
});

// Unused methods and bad requests.
app.all("/{*splat}", (req, res) => {
    res.send(`${req.method} not supported on ${req.path}\n`);
});

app.listen(port, async () => {
    await database.init();
    console.log(`Listening on port ${port}`);
});
