#!/usr/bin/env bun
// the above is a shebang file which helps in telling how to run this file.
import { init } from "./commands/init.ts";
import { add } from "./commands/add.ts";
import { commit } from "./commands/commit.ts";
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
    case "commit":
        if (args[1] !== "-m") {
            console.log(
                `Please use proper format. Do groot /help for more information`,
            );
            break;
        } else {
            if (!args[2]) {
                console.log(
                    `Please provide a commit message. Usage groot commit -m "commit message"`,
                );
                break;
            }
            commit(args[2]);
            break;
        }
    default:
        console.log(`Unknown Command called: ${command}`);
}
