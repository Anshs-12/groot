import { init } from "./commands/init.ts";
import { add } from "./commands/add.ts";
const args = process.argv.slice(2);
const command = args[0];

switch (command) {
    case "init":
        init();
        break;
    case "add":
        if (!args[1]) {
            console.log("Please provide a filename. Usage: gits add <file>");
            break;
        }
        add(args[1]);
        break;
    default:
        console.log(`Unknown Command called: ${command}`);
}
