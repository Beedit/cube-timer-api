import type { Status } from "../enums/Status.js";

/**
 * Represents a result of a function
 */
export default interface Result {
    /**
     * The status
     */
    status: Status
    /**
     * The result of the function
     */
    result?: unknown
}
