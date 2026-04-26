import fs from "fs";
import path from "path";
import crypto from "crypto";
import { fetchGrootPath, readFileTryCatch } from "../utils";

export function add(filePath: string) {
    let fileContent: string = readFileTryCatch(filePath);
    let absolutePath: string = path.resolve(filePath);
    let grootDirPath: string = fetchGrootPath();

    const hash: string = crypto
        .createHash("sha256")
        .update(fileContent)
        .digest("hex");

    const objectPath: string = path.join(
        grootDirPath,
        ".groot",
        "objects",
        hash,
    );
    fs.writeFileSync(objectPath, fileContent);

    const indexPath: string = path.join(grootDirPath, ".groot", "index.json");

    const indexContent: Record<string, string> = JSON.parse(
        readFileTryCatch(indexPath),
    );
    indexContent[absolutePath] = hash;
    fs.writeFileSync(indexPath, JSON.stringify(indexContent, null, 2));
    console.log(`Staging area updated successfully.`);
}
