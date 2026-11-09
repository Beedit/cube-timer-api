import { body, Result, type ValidationError } from "express-validator";
import { Status } from "../enums/Status.js";
import logger from "./logger.js";
import { db } from "../index.js";

/**
 * Creates a JSON to send to the client based on a status provided
 * @param status The status to turn into a JSON
 * @param result Optional item to send along with the status
 * @returns A JSON object with success or failure under the status key
 */
const createStatusJSON = (status: Status, result?: unknown) => {
    let response = {};
    // (status == Status.Success) ? { success: true, result: result } :
    switch (status) {
        case Status.Success:
            response = {
                success: true,
                result: result,
            };
            break;
        case Status.Fail:
            response = {
                success: false,
                errors: result,
            };
            break;
        case Status.NotFound:
            response = {
                success: false,
                errors: ["404 Not Found"],
            };
            break;
    }
    return response;
};

/**
 * Closes the database connection and exits the program
 */
const exit = (code?: string | number) => {
    if (db.isOpen()) {
        logger.info("Closing database connection");
        db.close();
        logger.info("Closed successfully. Exiting.");
        process.exit(code == "SIGINT" ? 130 : 0);
    }
};

/**
 * Converts a string to a boolean. Values of "true" and "1" are returned as true.
 * @param str Input string
 * @returns Boolean
 */
const stringToBool = (str: string) => {
    if (str == "true" || str == "1") {
        return true;
    } else {
        return false;
    }
};

export const handleId = () => body("id").isNumeric().trim().escape().withMessage("Please provide a valid ID");
export const handleTime = () => body("time").isNumeric().trim().escape().withMessage("Please provide a valid time");
export const handleDate = () => body("date").isNumeric().trim().escape().withMessage("Please provide a date");
export const handlePuzzle = () => body("puzzle").isString().trim().escape().withMessage("Please provide a puzzle type");
export const handleDnf = () => body("isDnf").isBoolean({ loose: true }).trim().escape().withMessage("Please provide a valid dnf status");
export const handlePlusTwo = () => body("plusTwoCount").isNumeric().trim().escape().withMessage("Please provide a valid +2 count");

export const handleScramble = () => {
    return body("scramble").trim().isString().custom((input) => {
        const regex = input.match(/(?!([0-9]|[UDLRFBMES' xyzw/+\-,()]|ALL|$))/img);
        if (regex) {
            return false;
        } else {
            return true;
        }
    }).escape().withMessage("Please provide a valid scramble");
};

export const handleNote = (optional: boolean) => {
    if (optional) {
        return body("note").optional().isString().trim().escape().withMessage("Please provide a valid note");
    } else {
        return body("note").isString().trim().escape().withMessage("Please provide a valid note");
    }
};

export const handleCategory = () => body("category").isString().trim().escape().custom((input) => {
    const categories = db.getCategories();
    let x = false;
    console.log(categories);

    categories.forEach((category) => {
        if (category.categoryName == input) {
            x = true;
            return;
        }
    });

    return x;
}).withMessage("Please provide a valid category");

export const handleCategoryCreation = () => body("category").isString().trim().escape().withMessage("Please provide a valid category");

/**
 * @returns Consistent HTTP 500 response.
 */
export const internalServerErrorJSON = () => createStatusJSON(Status.Fail, "Internal Server Error");
/**
 * @returns Consistent HTTP 400 Input error response.
 */
export const inputErrorJSON = (result: Result<ValidationError>) => createStatusJSON(Status.Fail, result.array());

export const notFoundJSON = () => createStatusJSON(Status.NotFound);

export { createStatusJSON, stringToBool, exit };
