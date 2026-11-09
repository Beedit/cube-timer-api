import express, { type Request, type Response } from "express";
import { createStatusJSON, handleCategory, handleCategoryCreation, handlePuzzle, inputErrorJSON, internalServerErrorJSON, notFoundJSON } from "../util/utilities.js";
import { Status } from "../enums/Status.js";
import { db } from "../index.js";
import { validationResult } from "express-validator";

export const categoryRouter = express.Router();

categoryRouter.get("/all",
    (_req: Request, res: Response) => {
        try {
            return res.send(createStatusJSON(Status.Success, db.getCategories()));
        } catch {
            return res.send(internalServerErrorJSON());
        }
    },
);

categoryRouter.post("/",
    handleCategoryCreation(),
    handlePuzzle(),
    (req: Request, res: Response) => {
        const result = validationResult(req);
        if (result.isEmpty()) {
            const insertionResult = db.createCategory(req.body.category, req.body.puzzle);

            if (insertionResult.status === Status.Success && typeof insertionResult.result === "string") {
                return res.status(200).send(createStatusJSON(insertionResult.status, insertionResult.result));
            } else if (insertionResult.status == Status.NotFound) {
                return res.status(404).send(notFoundJSON());
            } else {
                return res.status(500).send(internalServerErrorJSON());
            }
        } else {
            return res.status(400).send(inputErrorJSON(result));
        }
    },
);

categoryRouter.delete("/",
    handleCategory(),
    (req: Request, res: Response) => {
        const result = validationResult(req);
        if (result.isEmpty()) {
            const { status } = db.deleteCategory(req.body.category);
            if (status == Status.Success) {
                return res.status(200).send(createStatusJSON(status));
            } else if (status == Status.NotFound) {
                return res.status(404).send(notFoundJSON());
            } else {
                return res.status(500).send(internalServerErrorJSON());
            }
        } else {
            return res.status(400).send(inputErrorJSON(result));
        }
    },
);
