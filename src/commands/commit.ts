import fs from "fs";
import path from "path";
import crypto from "crypto";
import type { commitStructure } from "../utils";
import { fetchGrootPath, readFileTryCatch } from "../utils";

export function commit(message: string) {
    let grootDirPath: string = fetchGrootPath();
    let indexJsonPath: string = path.join(grootDirPath, ".groot", "index.json");

    let indexJsonFilecontent: Record<string, string> = JSON.parse(
        readFileTryCatch(indexJsonPath),
    );
    if (Object.keys(indexJsonFilecontent).length === 0) {
        console.log(`Nothing staged which is pending to be commit`);
    } else {
        // defining the structure of the commit

        let headPath: string = path.join(grootDirPath, ".groot", "HEAD.json");
        // reading out the HEAD.json content finding the last commit
        let head: string = JSON.parse(readFileTryCatch(headPath));
        // retrieving the snapshot if it exists otherwise creating a new snapshot for the intial commit;
        let retrievedRecord: Record<string, string>;
        if (head === null) {
            retrievedRecord = indexJsonFilecontent;
        } else {
            // getting the record from the parent commit;
            let parentCommitPath: string = path.join(
                grootDirPath,
                ".groot",
                "commits",
                `${head}.json`,
            );
            let parentCommitContent: commitStructure = JSON.parse(
                readFileTryCatch(parentCommitPath),
            );
            let mergedRecords = {
                ...parentCommitContent.snapshot,
                ...indexJsonFilecontent,
            };
            retrievedRecord = mergedRecords;
        }
        let commitObject: commitStructure = {
            commitId: "",
            commitMessage: message,
            timeStamp: new Date().toISOString(),
            snapshot: retrievedRecord,
            parent: head,
        };
        let commitIdHash: string = crypto
            .createHash("sha256")
            .update(JSON.stringify(commitObject))
            .digest("hex");

        commitObject.commitId = commitIdHash;

        let commitFilePath: string = path.join(
            grootDirPath,
            ".groot",
            "commits",
            commitIdHash + ".json",
        );
        fs.writeFileSync(commitFilePath, JSON.stringify(commitObject, null, 2));
        /*
            JSON.stringify(value, replacer, space)
            value — the object to convert.
            replacer — filter which fields to include. null means include everything.
            space — how many spaces to indent. 2 makes it pretty and readable.
        */
        fs.writeFileSync(headPath, JSON.stringify(commitIdHash, null, 2));
        fs.writeFileSync(indexJsonPath, JSON.stringify({}, null, 2));
    }
}
