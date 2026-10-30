import express, { type Request, type Response } from "express";
import logger from "./util/logger.js";
import Database from "./util/classes/database.js";
import { handleDate, handleNote, handleScramble, handleTime } from "./util/utilities.js";
import { validationResult } from "express-validator";

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

app.get("/getSolves",
    (_req: Request, res: Response) => {
        return res.send(db.getTimes());
    },
);

app.post("/addSolve",
    handleTime(),
    handleDate(),
    handleNote(),
    handleScramble(),
    async (req: Request, res: Response) => {
        const result = validationResult(req);
        if (result.isEmpty()) {
            const { changes, lastInsertRowid } = db.insertTime(req.body.time, req.body.date, req.body.scramble, req.body.note);

            return res.status((changes === 1) ? 200 : 500)
                .send({ id: lastInsertRowid });
        }
        else {
            return res.status(400).send(result);
        }
    },
);

// Unused methods and bad requests.
app.all("/{*splat}", (req, res) => {
    res.send(`${req.method} not supported on ${req.path}\n`);
});

app.listen(port, async () => {
    await db.init();
    logger.info(`Listening on port ${port}`);
});
