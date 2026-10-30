import { body } from "express-validator";

export const handleId = () => body("id").trim().isNumeric().escape().withMessage("Please provide a valid ID");
export const handleTime = () => body("time").trim().isNumeric().escape().withMessage("Please provide a valid time");
export const handleDate = () => body("date").trim().isNumeric().escape().withMessage("Please provide a date");
export const handleNote = () => body("note").optional().trim().isString().escape().withMessage("Please provide a valid note");
export const handlePuzzle = () => body("puzzle").optional().trim().isString().escape().withMessage("Please provide a puzzle type");

export const handleScramble = () => {
    return body("scramble").trim().isString().custom((input) => {
        const regex = input.match(/(?!([0-9]|[UDLRFBMES' xyzw/+\-,()]|ALL|$))/img);
        if (regex) {
            return false;
        }
        else {
            return true;
        }
    }).escape().withMessage("Please provide a valid scramble");
};
