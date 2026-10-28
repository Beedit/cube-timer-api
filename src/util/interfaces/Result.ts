import type { Status } from "../enum/Status.js";

export default interface Result {
    status: Status
    result?: unknown
}
