import fs from "fs";
import path from "path";
import crypto from "crypto";

export function add(filePath: string) {
    // the filePath users sends is a just the path of the file which he wants
    // but that wouldn't work as we need complete path of the file
    // so we need path.resolve() for that to work properly!
    const completeFilePath: string = path.resolve(filePath);
    let fileContent: string = fs.readFileSync(completeFilePath, "utf-8");
    let hashString: string = crypto
        .createHash("sha256")
        .update(fileContent)
        .digest("hex");
    let hashFilePath: string = path.join(
        process.cwd(),
        ".groot",
        "objects",
        hashString,
    );
    fs.writeFileSync(hashFilePath, fileContent);
    console.log(`Added ${completeFilePath} with hashCode ${hashString}`);
}
