import { body, Result, type ValidationError } from "express-validator";
import { Status } from "../enums/Status.js";

/**
 * Creates a JSON to send to the client based on a status provided
 * @param status The status to turn into a JSON
 * @param result Optional item to send along with the status
 * @returns A JSON object with success or failure under the status key
 */
const createStatusJSON = (status: Status, result?: unknown) => {
    return (status == Status.Success)
        ? {
            success: true,
            result: result,
        }
        : {
            success: false,
            errors: result,
        };
};

export const handleId = () => body("id").trim().isNumeric().escape().withMessage("Please provide a valid ID");
export const handleTime = () => body("time").trim().isNumeric().escape().withMessage("Please provide a valid time");
export const handleDate = () => body("date").trim().isNumeric().escape().withMessage("Please provide a date");
export const handleNote = () => body("note").optional().trim().isString().escape().withMessage("Please provide a valid note");
export const handlePuzzle = () => body("puzzle").optional().trim().isString().escape().withMessage("Please provide a puzzle type");
export const handleDnf = () => body("isDnf").trim().isBoolean().escape().withMessage("Please provide a valid dnf status");
export const handlePlusTwo = () => body("plusTwoCount").optional().trim().isNumeric().escape().withMessage("Please provide a valid +2 count");

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

/**
 * @returns Consistent HTTP 500 response.
 */
export const internalServerErrorJSON = () => createStatusJSON(Status.Fail, "Internal Server Error");
/**
 * @returns Consistent HTTP 400 Input error response.
 */
export const inputErrorJSON = (result: Result<ValidationError>) => createStatusJSON(Status.Fail, result.array());

export { createStatusJSON };
