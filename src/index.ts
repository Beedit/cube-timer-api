import express, { type NextFunction, type Request, type Response } from "express";
import logger from "./util/logger.js";
import { createStatusJSON, exit, internalServerErrorJSON } from "./util/utilities.js";
import { Status } from "./enums/Status.js";
import { solveRouter } from "./routes/solve.js";
import { Database } from "./classes/database.js";

/**
 * Default database for the app
 */
export const db = new Database("db.sqlite");

/**
 * Express app setup
 */
const port = 5000;
const app = express();
app.use(express.json());

/**
 * Log the request, ip and time when a request is made
 */
app.use((req: Request, _res: Response, next: NextFunction) => {
    logger.info(`Incoming ${req.method} request from ${req.ip} at ${new Date().toISOString()} on ${req.url}`);
    next();
});

/**
 * Error handling
 */
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

/**
 * Use all of the solve routes
 */
app.use("/solve", solveRouter);

// Unused methods and bad requests.
app.all("/{*splat}", (req, res) => {
    res.send(`${req.method} not supported on ${req.path}\n`);
});

/**
 * Handling connections ot the server and exits
 */
try {
    app.listen(port, async () => {
        await db.init();
        logger.info(`Listening on port ${port}`);
    });
} catch (error) {
    logger.fatal(new Error(String(error)));
}

process.on("SIGINT", (code) => {
    exit(code);
});

process.on("exit", (code) => {
    exit(code);
});
