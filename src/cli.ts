#!/usr/bin/env bun
// the above is a shebang file which helps in telling how to run this file.
import { init } from "./commands/init.ts";
import { add } from "./commands/add.ts";
import { commit } from "./commands/commit.ts";
import { log, logOneline } from "./commands/log.ts";
import { status } from "./commands/status.ts";
import { help } from "./commands/help.ts";
import { restore } from "./commands/restore.ts";
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
    case "log":
        if (!args[1]) {
            log();
            break;
        } else if (args[1] === "--oneline") {
            logOneline();
            break;
        } else {
            console.log(
                `Invalid command, please refer groot /help for all commands!`,
            );
            break;
        }
    case "status":
        status();
        break;
    case "restore":
        if (args[1] !== "--staged") {
            console.log(
                `Invalid command, please refer groot /help for all commands!`,
            );
            break;
        }
        if (!args[2]) {
            console.log(
                `Please provide a file name, or refer groot /help for all commands!`,
            );
            break;
        }
        restore(args[2]!);
        break;
    case "help":
        help();
        break;
    default:
        help();
        break;
}
