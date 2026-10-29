import { DatabaseSync } from "node:sqlite";
import { Status } from "./enum/Status.js";
import type Time from "./interfaces/Time.js";
import type Result from "./interfaces/Result.js";
import { isTime } from "./interfaces/Time.js";

/**
 * The database connection. Unopened until init() is called.
 */
const db = new DatabaseSync("db.sqlite", { open: false });

/**
 * Initialises the database and creates a table if it does not exist.
 * @returns Status to describe the connection state
 */
const init = async (): Promise<Status> => {
    return new Promise((resolve) => {
        try {
            db.open();

            db.exec(`CREATE TABLE IF NOT EXISTS times(
                id INTEGER PRIMARY KEY, 
                time REAL NOT NULL,
                plusTwo INTEGER NOT NULL CHECK (plusTwo >= 0),
                dnf INTEGER NOT NULL CHECK (dnf in (0, 1)),
                date INTEGER NOT NULL,
                scramble TEXT NOT NULL,
                note TEXT NOT NULL
                );
            `);

            resolve(Status.Success);
        }
        catch (err) {
            resolve(Status.Fail);
            throw new Error("", { cause: err });
        }
    });
};

/**
 * Creates a new time in the database.
 * @param time The time of the solve
 * @param date The date that it happened
 * @param scramble The scramble as a string
 * @param note Optional note
 * @returns The ID of the new row
 */
const insertTime = (time: number, date: number, scramble: string, note?: string) => {
    const { lastInsertRowid } = db.prepare(`insert into 
        times (time, plusTwo, dnf, date, scramble, note)
        values (?, 0, 0, ?, ?, ?)
    `).run(time, date, scramble, note ?? "");

    return lastInsertRowid;
};

/**
 * Returns a list of times.
 * @returns A list of times in order from oldest to newest
 */
const getTimes = () => {
    const timesInitial = db.prepare("SELECT * FROM times").all();

    const times: Time[] = [];

    timesInitial.forEach((time) => {
        const t = {
            id: time["id"] as number,
            time: time["time"] as number,
            // !! converts to boolean cos "as boolean" isnt allowed
            dnf: !!time["dnf"],
            plusTwo: time["plusTwo"] as number,
            date: time["date"] as number,
            scramble: time["scramble"] as string,
            note: time["note"] as string,
        } as Time;

        times.push(t);
    });

    return times.sort((a, b) => {
        if (a.date > b.date) {
            return 1;
        }
        else {
            return -1;
        }
    });
};
/**
 * Gets a specific time from its id
 * @param id The id to use to find the time
 * @returns Result with time if found in the result key
 */
const getTimeById = (id: number) => {
    const time = db.prepare("SELECT * FROM times WHERE id = ?").all(id)[0];

    if (time) {
        const t = {
            id: time["id"] as number,
            time: time["time"] as number,
            dnf: !!time["dnf"],
            plusTwo: time["plusTwo"] as number,
            date: time["date"] as number,
            scramble: time["scramble"] as string,
            note: time["note"] as string,
        } as Time;

        return { status: Status.Success, result: t } as Result;
    }
    else {
        return { status: Status.Fail };
    }
};

/**
 * Sets a time's DNF value
 * @param id The id to change
 * @param isDnf What to change its DNF value to
 * @returns Result holding its status
 */
const setDnf = (id: number, isDnf: boolean) => {
    const { status, result: time } = getTimeById(id);

    if (status == Status.Success && isTime(time)) {
        db.prepare(`UPDATE times
            SET dnf = ?
            WHERE id = ?`,
        ).run(+isDnf, id);

        return { status: Status.Success } as Result;
    }
    return { status: Status.Fail } as Result;
};

/**
 * Sets a time's +2 value
 * @param id The id to change
 * @param plusTwoCount What to change its +2 value to
 * @returns Result holding its status
 */
const setPlusTwo = (id: number, plusTwoCount: number) => {
    const { status, result: time } = getTimeById(id);

    if (status == Status.Success && isTime(time)) {
        db.prepare(`UPDATE times
            SET plusTwo = ?
            WHERE id = ?`,
        ).run(plusTwoCount, id);

        return { status: Status.Success } as Result;
    }
    return { status: Status.Fail } as Result;
};

/**
 * Sets a time's note
 * @param id The id to change
 * @param note What to change its note to
 * @returns Result holding its status
 */
const setNote = (id: number, note: string) => {
    const { status, result: time } = getTimeById(id);

    if (status == Status.Success && isTime(time)) {
        db.prepare(`UPDATE times
            SET note = ?
            WHERE id = ?`,
        ).run(note, id);

        return { status: Status.Success } as Result;
    }
    return { status: Status.Fail } as Result;
};

export { db, init, insertTime, getTimes, setDnf, getTimeById, setPlusTwo, setNote };
