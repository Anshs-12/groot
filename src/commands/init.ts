import path from "path";
import fs from "fs";

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
        // this helps in defaulting the errors if the .groot folder already exists!
        console.log("Already Initialized an empty groot repository!");
    } else {
        console.log(`
          __ _ _ __ ___   ___ | |_
         / _\` | '__/ _ \\ / _ \\| __|
        | (_| | | | (_) | (_) | |_
         \\__, |_|  \\___/ \\___/ \\__|
         |___/
        `);
        console.log("Initializing an empty groot repository...");
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
    }
}
