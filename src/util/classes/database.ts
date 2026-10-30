import { DatabaseSync } from "node:sqlite";
import { Status } from "../enum/Status.js";
import type Time from "../interfaces/Time.js";
import type Result from "../interfaces/Result.js";
import { isTime } from "../interfaces/Time.js";
import logger from "../logger.js";

export default class Database {
    /**
     * String holding the path of the database file.
     */
    dbPath: string;
    /**
     * The database connection. Unopened until init() is called.
     */
    db: DatabaseSync;

    /**
     * Creates a new Database object
     * @param dbPath The path of the database file
     */
    constructor(dbPath: string) {
        this.dbPath = dbPath;
        this.db = new DatabaseSync(this.dbPath, { open: false });
    }

    /**
     * Initialises the database and creates a table if it does not exist.
     * @returns Status to describe the connection state
     */
    async init(): Promise<Status> {
        return new Promise((resolve) => {
            try {
                this.db.open();

                this.db.exec(`
                    CREATE TABLE IF NOT EXISTS times(
                    id INTEGER PRIMARY KEY, 
                    puzzle TEXT NOT NULL,
                    time REAL NOT NULL,
                    plusTwo INTEGER NOT NULL CHECK (plusTwo >= 0),
                    dnf INTEGER NOT NULL CHECK (dnf in (0, 1)),
                    date INTEGER NOT NULL,
                    scramble TEXT NOT NULL,
                    note TEXT NOT NULL
                );
            `);

                resolve(Status.Success);
            } catch (err) {
                resolve(Status.Fail);
                logger.fatal(new Error(`Fatal error in initialisation of database: ${err}`));
            }
        });
    }

    /**
     * Creates a new time in the database.
     * @param puzzle The puzzle type
     * @param time The time of the solve
     * @param date The date that it happened
     * @param scramble The scramble as a string
     * @param note Optional note
     * @returns The status of the insertion and if it succeeded, then the id
     */
    insertTime(puzzle: string, time: number, date: number, scramble: string, note?: string) {
        try {
            const { changes, lastInsertRowid } = this.db.prepare(`insert into 
            times (puzzle, time, plusTwo, dnf, date, scramble, note)
            values (?, ?, 0, 0, ?, ?, ?)
        `).run(puzzle, time, date, scramble, note ?? "");

            if (changes == 1) {
                return {
                    status: Status.Success,
                    result: String(lastInsertRowid),
                } as Result;
            } else {
                return { status: Status.Fail };
            }
        } catch {
            return { status: Status.Fail };
        }
    }

    /**
     * Returns a list of times.
     * @returns A list of times in order from oldest to newest
     */
    getTimes() {
        const timesInitial = this.db.prepare("SELECT * FROM times").all();

        const times: Time[] = [];

        timesInitial.forEach((time) => {
            const t: Time = {
                id: time["id"] as number,
                puzzle: time["puzzle"] as string,
                time: time["time"] as number,
                // !! converts to boolean cos "as boolean" isnt allowed
                dnf: !!time["dnf"],
                plusTwo: time["plusTwo"] as number,
                date: time["date"] as number,
                scramble: time["scramble"] as string,
                note: time["note"] as string,
            };

            times.push(t);
        });

        return times.sort((a, b) => {
            if (a.date > b.date) {
                return 1;
            } else {
                return -1;
            }
        });
    }

    /**
     * Gets a specific time from its id
     * @param id The id to use to find the time
     * @returns Result with time if found in the result key
     */
    getTimeById(id: number) {
        const time = this.db.prepare("SELECT * FROM times WHERE id = ?").all(id)[0];

        if (time) {
            const t: Time = {
                id: time["id"] as number,
                puzzle: time["puzzle"] as string,
                time: time["time"] as number,
                dnf: !!time["dnf"],
                plusTwo: time["plusTwo"] as number,
                date: time["date"] as number,
                scramble: time["scramble"] as string,
                note: time["note"] as string,
            };

            return { status: Status.Success, result: t } as Result;
        } else {
            return { status: Status.Fail };
        }
    }

    /**
     * Sets a time's DNF value
     * @param id The id to change
     * @param isDnf What to change its DNF value to
     * @returns Result holding its status
     */
    setDnf(id: number, isDnf: boolean) {
        const { status, result: time } = this.getTimeById(id);
        try {
            if (status == Status.Success && isTime(time)) {
                this.db.prepare(`UPDATE times SET dnf = ${isDnf} WHERE id = ${id}`).run();

                return { status: Status.Success } as Result;
            }
            return { status: Status.Fail } as Result;
        } catch {
            return { status: Status.Fail } as Result;
        }
    }

    /**
     * Sets a time's +2 value
     * @param id The id to change
     * @param plusTwoCount What to change its +2 value to
     * @returns Result holding its status
     */
    setPlusTwo(id: number, plusTwoCount: number) {
        const { status, result: time } = this.getTimeById(id);
        try {
            if (status == Status.Success && isTime(time)) {
                this.db.prepare(`UPDATE times SET plusTwo = ${plusTwoCount} WHERE id = ${id}`).run();

                return { status: Status.Success } as Result;
            }
            return { status: Status.Fail } as Result;
        } catch {
            return { status: Status.Fail } as Result;
        }
    }

    /**
     * Sets a time's note
     * @param id The id to change
     * @param note What to change its note to
     * @returns Result holding its status
     */
    setNote(id: number, note: string) {
        const { status, result: time } = this.getTimeById(id);
        try {
            if (status == Status.Success && isTime(time)) {
                this.db.prepare(`UPDATE times SET note = ${note} WHERE id = ${id}`).run();

                return { status: Status.Success } as Result;
            }
            return { status: Status.Fail } as Result;
        } catch {
            return { status: Status.Fail } as Result;
        }
    }

    deleteSolve(id: number) {
        const { changes } = this.db.prepare("DELETE FROM times WHERE id = ?").run(id);

        if (changes == 1) {
            return { status: Status.Success } as Result;
        } else {
            return { status: Status.Fail } as Result;
        }
    }
}
