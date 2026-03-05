import path from "path";
import fs from "fs";

export function init() {
    let grootFolderPath: string = path.join(process.cwd(), ".groot");
    if (fs.existsSync(grootFolderPath)) {
        // this helps in defaulting the errors if the .groot folder already exists!
        console.log("Already Initialized an empty groot repository!");
    } else {
        console.log("Initializing a empty gits repo!!");
        fs.mkdirSync(grootFolderPath);
        fs.mkdirSync(path.join(grootFolderPath, "objects"));
        fs.mkdirSync(path.join(grootFolderPath, "commits"));
        fs.writeFileSync(path.join(grootFolderPath, "index.json"), "[]");
        fs.writeFileSync(path.join(grootFolderPath, "HEAD.json"), "null");
    }
}
