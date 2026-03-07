import fs from "fs";
import path from "path";
import crypto from "crypto";

export function commit(message: string) {
    let indexJsonPath: string = path.join(
        process.cwd(),
        ".groot",
        "index.json",
    );

    let content: { file: string; hash: string }[] = JSON.parse(
        fs.readFileSync(indexJsonPath, "utf-8"),
    );
    if (content.length === 0) {
        console.log(`Nothing staged which is pending to be commit`);
    } else {
        // defining the structure of the commit
        type commitStructure = {
            commitId: string;
            commitMessage: string;
            timeStamp: string;
            files: { file: string; hash: string }[];
            parent: string | null;
        };

        let headPath: string = path.join(process.cwd(), ".groot", "HEAD.json");
        let head: string = JSON.parse(fs.readFileSync(headPath, "utf-8"));
        let commitObject: commitStructure = {
            commitId: "",
            commitMessage: message,
            timeStamp: new Date().toISOString(),
            files: content,
            parent: head,
        };
        let commitIdHash: string = crypto
            .createHash("sha256")
            .update(JSON.stringify(commitObject))
            .digest("hex");

        commitObject.commitId = commitIdHash;

        let commitFilePath: string = path.join(
            process.cwd(),
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
        fs.writeFileSync(indexJsonPath, JSON.stringify([], null, 2));
    }
}
