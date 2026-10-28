export default interface Time {
    id: number
    time: number
    dnf: boolean
    plusTwo: boolean
    date: number
}

/**
 *
 * @param check The object to check
 * @returns Boolean of if the object implements Time
 */
// ESlint rule disabled because the point is literally to pass in any object of any type.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const isTime = (check: any): check is Time => {
    return (
        check
        && typeof check.id === "number"
        && typeof check.time === "number"
        && typeof check.dnf === "boolean"
        && typeof check.plusTwo === "boolean"
        && typeof check.date === "number"
    );
};
