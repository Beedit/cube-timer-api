import { Logger } from "tslog";

/**
 * Logger for program.
 */
export default new Logger({
    minLevel: "INFO",
    stack: {
        capture: "off",
    },
    name: "Cube Timer Backend",
    pretty: {
        template: "{{dateIsoStr}} {{logLevelName}}\t{{name}} >> ",
    },
});
