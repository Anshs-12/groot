import path from "path";
import fs from "fs";
import chalk from "chalk";
import figlet from "figlet";
import boxen from "boxen";
const primary = chalk.hex("#7dd3fc"); // light blue
const secondary = chalk.hex("#e5e7eb"); // soft white
const muted = chalk.hex("#94a3b8"); // subtle gray
export function init() {
    let grootFolderPath: string = path.join(process.cwd(), ".groot");
    let grootIgnoreFolderPath: string = path.join(
        process.cwd(),
        ".grootignore",
    );
    if (
        fs.existsSync(grootFolderPath) &&
        fs.existsSync(grootIgnoreFolderPath)
    ) {
        console.log("Already Initialized an empty groot repository!");
    } else {
        fs.mkdirSync(grootFolderPath);
        fs.mkdirSync(path.join(grootFolderPath, "objects"));
        fs.mkdirSync(path.join(grootFolderPath, "commits"));
        fs.writeFileSync(path.join(grootFolderPath, "index.json"), "{}");
        fs.writeFileSync(path.join(grootFolderPath, "HEAD.json"), "null");
        // creating an .grootIgnore file to ignore the files which are not required
        // just like .gitIgnore
        fs.writeFileSync(
            path.join(grootIgnoreFolderPath),
            "node_modules\n.git\n.gitignore\n.groot\n.grootignore",
        );
        // Beautiful initialization output
        const title = figlet.textSync("GROOT", {
            font: "ANSI Shadow",
            horizontalLayout: "default",
        });
        console.log("\n");
        console.log(primary(title));
        console.log(
            boxen(secondary.bold("  Welcome to Groot VCS  "), {
                padding: { top: 1, bottom: 1, left: 3, right: 3 },
                borderStyle: "round",
                borderColor: "#7dd3fc",
            }),
        );
        console.log(secondary("📁 Repo: ") + muted(process.cwd()));
        console.log(primary("✨ Repo initialized successfully"));
        console.log("\n");
    }
}
