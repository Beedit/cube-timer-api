import express, { type Request, type Response } from 'express';
import { validationResult } from 'express-validator';
import { Status } from '../enums/Status.js';
import { handleNote, handleScramble, createStatusJSON, internalServerErrorJSON, inputErrorJSON, handleId, handleDnf, handlePlusTwo, handleTime, handleDate, handlePuzzle, notFoundJSON } from '../util/utilities.js';
import { db } from '../index.js';

export const solveRouter = express.Router();

solveRouter.put("/dnf",
    handleId(),
    handleDnf(),
    async (req: Request, res: Response) => {
        const result = validationResult(req);
        if (result.isEmpty()) {
            const { status } = db.setDnf(req.body.id, req.body.isDnf);
            if (status == Status.Success) {
                return res.status(200).send(createStatusJSON(status));
            } else if (status == Status.NotFound) {
                return res.status(404).send(notFoundJSON())
            } else {
                return res.status(500).send(internalServerErrorJSON());
            }
        } else {
            return res.status(400).send(inputErrorJSON(result));
        }
    },
);

solveRouter.put("/plusTwo",
    handleId(),
    handlePlusTwo(),
    async (req: Request, res: Response) => {
        const result = validationResult(req);
        if (result.isEmpty()) {
            const { status } = db.setPlusTwo(req.body.id, req.body.plusTwoCount);
            if (status == Status.Success) {
                return res.status(200).send(createStatusJSON(status));
            } else if (status == Status.NotFound) {
                return res.status(404).send(notFoundJSON())
            } else {
                return res.status(500).send(internalServerErrorJSON());
            }
        } else {
            return res.status(400).send(inputErrorJSON(result));
        }
    },
);

solveRouter.put("/note",
    handleId(),
    handleNote(),
    async (req: Request, res: Response) => {
        const result = validationResult(req);
        if (result.isEmpty()) {
            const { status } = db.setNote(req.body.id, req.body.note);
            if (status == Status.Success) {
                return res.status(200).send(createStatusJSON(status));
            } else if (status == Status.NotFound) {
                return res.status(404).send(notFoundJSON())
            } else {
                return res.status(500).send(internalServerErrorJSON());
            }
        } else {
            return res.status(400).send(inputErrorJSON(result));
        }
    },
);

solveRouter.put("/scramble",
    handleId(),
    handleScramble(),
    async (req: Request, res: Response) => {
        const result = validationResult(req);
        if (result.isEmpty()) {
            const { status } = db.setScramble(req.body.id, req.body.scramble);
            if (status == Status.Success) {
                return res.status(200).send(createStatusJSON(status));
            } else if (status == Status.NotFound) {
                return res.status(404).send(notFoundJSON())
            } else {
                return res.status(500).send(internalServerErrorJSON());
            }
        } else {
            return res.status(400).send(inputErrorJSON(result));
        }
    },
);

solveRouter.delete("/",
    handleId(),
    async (req: Request, res: Response) => {
        const result = validationResult(req);
        if (result.isEmpty()) {
            const { status } = db.deleteSolve(req.body.id);
            if (status == Status.Success) {
                return res.status(200).send(createStatusJSON(status));
            } else if (status == Status.NotFound) {
                return res.status(404).send(notFoundJSON())
            } else {
                return res.status(500).send(internalServerErrorJSON());
            }
        } else {
            return res.status(400).send(inputErrorJSON(result));
        }
    },
);

solveRouter.post("/",
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
            } else if (insertionResult.status == Status.NotFound) {
                return res.status(404).send(notFoundJSON())
            } else {
                return res.status(500).send(internalServerErrorJSON());
            }
        } else {
            return res.status(400).send(inputErrorJSON(result));
        }
    },
);

solveRouter.get("/all",
    (_req: Request, res: Response) => {
        try {
            return res.send(createStatusJSON(Status.Success, db.getTimes()));
        } catch (error) {
            return res.send(createStatusJSON(Status.Fail))
        }
    },
);