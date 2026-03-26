import fs from "fs";
import path from "path";
import crypto from "crypto";
import { fetchGrootPath } from "../utils";

export function add(filePath: string) {
    const absolutePath: string = path.resolve(filePath);
    const fileContent: string = fs.readFileSync(absolutePath, "utf-8");
    let grootDirPath: string = fetchGrootPath();
    console.log(`Reading file: ${absolutePath}`);

    const hash: string = crypto
        .createHash("sha256")
        .update(fileContent)
        .digest("hex");

    console.log(`Hash generated: ${hash}`);

    const objectPath: string = path.join(
        grootDirPath,
        ".groot",
        "objects",
        hash,
    );
    fs.writeFileSync(objectPath, fileContent);

    console.log(`Saved to objects: ${hash}`);

    const indexPath: string = path.join(grootDirPath, ".groot", "index.json");
    const stagingArea: {
        file: string;
        hash: string;
    }[] = JSON.parse(fs.readFileSync(indexPath, "utf-8"));

    let existingIndex: number = stagingArea.findIndex(
        (item) => item.file === absolutePath,
    );

    if (stagingArea[existingIndex]) {
        stagingArea[existingIndex].hash = hash;
    } else {
        stagingArea.push({ file: absolutePath, hash: hash });
        console.log(`Staged new file: ${filePath}`);
    }

    fs.writeFileSync(indexPath, JSON.stringify(stagingArea, null, 2));
    console.log(`Staging area updated successfully.`);
}
