import fs from "fs";
import path from "path";
import crypto from "crypto";
import {
    fetchGrootPath,
    readFileTryCatch,
    type commitStructure,
} from "../utils";

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

    const indexJsonPath: string = path.join(
        grootDirPath,
        ".groot",
        "index.json",
    );

    const indexJsonFilecontent: Record<string, string> = JSON.parse(
        readFileTryCatch(indexJsonPath),
    );
    let headPath: string = path.join(grootDirPath, ".groot", "HEAD.json");
    let head: string = JSON.parse(readFileTryCatch(headPath));
    let allSnapshots: Record<string, string>;
    if (head === null) {
        allSnapshots = {};
    } else {
        let headCommit: commitStructure = JSON.parse(
            readFileTryCatch(
                path.join(grootDirPath, ".groot", "commits", head + ".json"),
            ),
        );
        allSnapshots = headCommit.snapshot;
    }
    if (allSnapshots[absolutePath] === hash) {
        console.log("nothing to stage, file unchanged");
    } else {
        indexJsonFilecontent[absolutePath] = hash;
        fs.writeFileSync(
            indexJsonPath,
            JSON.stringify(indexJsonFilecontent, null, 2),
        );
        console.log(`Staging area updated successfully.`);
    }
}
