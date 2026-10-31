import express, { type NextFunction, type Request, type Response } from "express";
import logger from "./util/logger.js";
import Database from "./util/classes/database.js";
import { createStatusJSON, handleDate, handleDnf, handleId, handleNote, handlePlusTwo, handlePuzzle, handleScramble, handleTime, inputErrorJSON, internalServerErrorJSON } from "./util/utilities.js";
import { validationResult } from "express-validator";
import { Status } from "./util/enum/Status.js";

const db = new Database("db.sqlite");

// Express app setup
const port = 5000;
const app = express();
app.use(express.json());

// Log the request, ip and time when a request is made
app.use((req: Request, _res: Response, next: NextFunction) => {
    logger.info(`Incoming ${req.method} request from ${req.ip} at ${new Date().toISOString()} on ${req.url}`);
    next();
});

// Error handling
app.use((err: Error, _req: Request, res: Response, next: NextFunction) => {
    if (err instanceof SyntaxError && "body" in err) {
        return res.status(400).send(createStatusJSON(Status.Fail, "SyntaxError: JSON is malformed"));
    } else if (err) {
        logger.error(err);
        return res.status(500).send(internalServerErrorJSON());
    } else {
        return next();
    }
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
    handlePuzzle(),
    async (req: Request, res: Response) => {
        const result = validationResult(req);
        if (result.isEmpty()) {
            const insertionResult = db.insertTime(req.body.scramble, req.body.time, req.body.date, req.body.scramble, req.body.note);

            if (insertionResult.status === Status.Success && typeof insertionResult.result === "string") {
                return res.status(200).send(createStatusJSON(insertionResult.status, insertionResult.result));
            } else {
                return res.status(500).send(internalServerErrorJSON());
            }
        } else {
            return res.status(400).send(inputErrorJSON(result));
        }
    },
);

app.put("/setDnf",
    handleId(),
    handleDnf(),
    async (req: Request, res: Response) => {
        const result = validationResult(req);
        if (result.isEmpty()) {
            const { status } = db.setDnf(req.body.id, req.body.isDnf);
            if (status == Status.Success) {
                return res.status(200).send(createStatusJSON(status));
            } else {
                return res.status(500).send(internalServerErrorJSON());
            }
        } else {
            return res.status(400).send(inputErrorJSON(result));
        }
    },
);

app.put("/setPlusTwo",
    handleId(),
    handlePlusTwo(),
    async (req: Request, res: Response) => {
        const result = validationResult(req);
        if (result.isEmpty()) {
            const { status } = db.setPlusTwo(req.body.id, req.body.plusTwoCount);
            if (status == Status.Success) {
                return res.status(200).send(createStatusJSON(status));
            } else {
                return res.status(500).send(internalServerErrorJSON());
            }
        } else {
            return res.status(400).send(inputErrorJSON(result));
        }
    },
);

app.put("/setNote",
    handleId(),
    handleNote(),
    async (req: Request, res: Response) => {
        const result = validationResult(req);
        if (result.isEmpty()) {
            const { status } = db.setNote(req.body.id, req.body.note);
            if (status == Status.Success) {
                return res.status(200).send(createStatusJSON(status));
            } else {
                return res.status(500).send(internalServerErrorJSON());
            }
        } else {
            return res.status(400).send(inputErrorJSON(result));
        }
    },
);

app.delete("/deleteSolve",
    handleId(),
    async (req: Request, res: Response) => {
        const result = validationResult(req);
        if (result.isEmpty()) {
            const { status } = db.deleteSolve(req.body.id);
            if (status == Status.Success) {
                return res.status(200).send(createStatusJSON(status));
            } else {
                return res.status(500).send(internalServerErrorJSON());
            }
        } else {
            return res.status(400).send(inputErrorJSON(result));
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
